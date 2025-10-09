use tauri::{AppHandle, Manager, command};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_fs::FsExt;
use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use crate::book::current_time_string;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Imported {
    path: String,
    r#type: String,
    timestamp: String,
}

#[command]
//main function
pub fn import_book(app: AppHandle, r#type: &str, mode: Option<&str>) -> Result<Imported, String> {
    // 1️⃣ Open folder picker dialog
    let folder = app.dialog().file().blocking_pick_folder();
    let folder_path: PathBuf = match folder {
        Some(file_path) => file_path.as_path().ok_or("Failed to import the selected Folder")?.to_path_buf(),
        None => return Err("No folder selected".into()),
    };

    if !folder_path.exists() {
        return Err("Folder does not exist".into());
    }

    // 2️⃣ Perform operation based on type
    let path_str = match r#type {
        "external" => select_and_register_folder(app.clone(), folder_path, mode)?,
        "internal" => import_selected_folder(app.clone(), folder_path.to_str().ok_or("Invalid path")?)?,
        _ => return Err("Invalid import type".into()),
    };

    // 3️⃣ Build Imported record
    let imported = Imported {
        path: path_str.clone(),
        r#type: r#type.to_string(),
        timestamp: current_time_string(),
    };

    // 4️⃣ Save record persistently in imported.json
    save_imported_record(&app, &imported)?;

    Ok(imported)
}

// ---------- File System Scope Registration ---------- //
#[command]
pub fn register_fs_scope(app: AppHandle, path: String) -> Result<(), String> {
    app.fs_scope()
        .allow_directory(&path, true)
        .map_err(|e| format!("Failed to add scope: {}", e))?;
    Ok(())
}

#[command]
pub fn select_and_register_folder(app: AppHandle, folder_path: PathBuf, mode: Option<&str>) -> Result<String, String> {
    let path_str = folder_path
        .to_str()
        .ok_or_else(|| "Invalid folder path (non-UTF8)".to_string())?
        .to_string();

    if let Some("bypass") = mode {
        println!("Bypassing fs scope registration...");
        return Ok(path_str);
    }

    register_fs_scope(app, path_str.clone())?;
    println!("✅ Registered FS scope for external folder: {}", path_str);
    Ok(path_str)
}

// ---------- Internal Folder Import ---------- //
#[command]
pub fn import_selected_folder(app: AppHandle, source_path: &str) -> Result<String, String> {
    let app_dir = app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?
        .to_path_buf();

    let imported_dir = app_dir.join("data").join("imported");
    if !imported_dir.exists() {
        fs::create_dir_all(&imported_dir)
            .map_err(|e| format!("Failed to create Imported folder: {}", e))?;
    }

    let source = PathBuf::from(source_path);
    if !source.exists() {
        return Err("Source path does not exist".into());
    }

    let folder_name = source
        .file_name()
        .ok_or("Invalid folder name")?;
    let destination = imported_dir.join(folder_name);

    // Copy source folder into app's imported directory
    copy_dir_all(&source, &destination)?;

    // 🔹 If the imported folder is flat (no subfolders), normalize it
    normalize_flat_import(&destination)?;

    println!("✅ Imported and normalized to: {:?}", destination);
    Ok(destination.to_string_lossy().to_string())
}

// ---------- Normalize Flat Imports ---------- //
fn normalize_flat_import(destination: &PathBuf) -> Result<(), String> {
    let has_subdirs = fs::read_dir(destination)
        .map_err(|e| format!("Failed to read imported folder: {}", e))?
        .any(|entry| entry.ok().map_or(false, |e| e.path().is_dir()));

    if !has_subdirs {
        println!("📁 Flat folder detected — normalizing into chapter-1/");
        let chapter_dir = destination.join("chapter-1");
        fs::create_dir_all(&chapter_dir)
            .map_err(|e| format!("Failed to create chapter folder: {}", e))?;

        for entry in fs::read_dir(&destination)
            .map_err(|e| format!("Failed to scan images for move: {}", e))? 
        {
            let entry = entry.map_err(|e| format!("Dir entry error: {}", e))?;
            let path = entry.path();

            if path.is_file() {
                if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                    if ["jpg", "jpeg", "png", "webp"].contains(&ext.to_lowercase().as_str()) {
                        let filename = path.file_name().unwrap();
                        let new_path = chapter_dir.join(filename);
                        fs::rename(&path, &new_path)
                            .map_err(|e| format!("Failed to move file: {}", e))?;
                    }
                }
            }
        }
    }
    Ok(())
}

// ---------- Recursive Copy Helper ---------- //
fn copy_dir_all(src: &PathBuf, dst: &PathBuf) -> Result<(), String> {
    fs::create_dir_all(dst)
        .map_err(|e| format!("Failed to create folder: {}", e))?;

    for entry in fs::read_dir(src).map_err(|e| format!("Failed to read dir: {}", e))? {
        let entry = entry.map_err(|e| format!("Dir entry error: {}", e))?;
        let ty = entry.file_type().map_err(|e| format!("File type error: {}", e))?;

        if ty.is_dir() {
            copy_dir_all(&entry.path(), &dst.join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.join(entry.file_name()))
                .map_err(|e| format!("File copy error: {}", e))?;
        }
    }
    Ok(())
}

// ---------- Persistent JSON Saving ---------- //
fn save_imported_record(app: &AppHandle, imported: &Imported) -> Result<(), String> {
    let app_data_dir = app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let data_dir = app_data_dir.join("data");
    fs::create_dir_all(&data_dir)
        .map_err(|e| format!("Failed to create data dir: {}", e))?;

    let imported_json_path = data_dir.join("imported.json");

    // Load existing records
    let mut imports: Vec<Imported> = if imported_json_path.exists() {
        let content = fs::read_to_string(&imported_json_path)
            .map_err(|e| format!("Failed to read imported.json: {}", e))?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        vec![]
    };

    // Add new import if not duplicate
    if !imports.iter().any(|i| i.path == imported.path) {
        imports.push(imported.clone());
    } else {
        println!("⚠️  Skipped duplicate import: {}", imported.path);
    }

    // Write final data
    let updated_json = serde_json::to_string_pretty(&imports)
        .map_err(|e| format!("Failed to serialize imported.json: {}", e))?;
    fs::write(&imported_json_path, updated_json)
        .map_err(|e| format!("Failed to write imported.json: {}", e))?;

    println!("📁 Updated imported.json with {:?}", imported.path);
    Ok(())
}
