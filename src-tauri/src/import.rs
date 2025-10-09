use serde::de::value::Error;
use tauri::Manager;
use tauri::AppHandle;
use tauri::command;
use tauri_plugin_dialog::DialogExt;
use base64::{engine::general_purpose, Engine as _};
use std::fmt::format;
use serde::{Deserialize, Serialize};
use std::option;
use std::{collections::HashMap, fs, path::PathBuf, sync::Mutex};
use once_cell::sync::Lazy;
use tauri_plugin_fs::FsExt;
use crate::book::current_time_string;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Imported {
    path: String,
    r#type: String,
    timestamp: String,
}

#[command]
pub fn import_book(app: AppHandle, r#type: &str , mode: Option<&str>) -> Result<Imported, String>{
    let folder = app.dialog().file().blocking_pick_folder();
    //
    let folder_path: PathBuf = match folder {
        Some(file_path) => {
            file_path.as_path()
                .ok_or("Selected folder path is invalid")?
                .to_path_buf()
        }
        None => return Err("No folder selected".into()),
    };

    if !folder_path.exists() {
        return Err("Folder does not exist".into());

    }

    let path_str = if r#type == "external" {
        select_and_register_folder(app.clone(), folder_path, mode)?
    } else if r#type == "internal" {
        import_selected_folder(app.clone(), folder_path.to_str().ok_or("Invalid path")?)?
    } else {
        return Err("Invalid import type".into());
    };

    let imported = Imported {
        path: path_str,
        r#type: r#type.to_string(),
        timestamp: current_time_string(),
    };
    Ok(imported)
}

#[command]
pub fn register_fs_scope(app: tauri::AppHandle, path: String) -> Result<(), String> {
    app.fs_scope().allow_directory(&path, true)
        .map_err(|e| format!("Failed to add scope: {}", e))?;
    Ok(())
}
#[command]
pub fn select_and_register_folder(app: tauri::AppHandle, folder_path: PathBuf, mode: Option<&str>) -> Result<String, String> {
    
    // unwrap the inner path before using to_str()
   

    let path_str = folder_path
        .to_str()
        .ok_or_else(|| "Invalid folder path (non-UTF8)".to_string())?
        .to_string();

    if let Some("bypass") = mode {
        println!("Bypassing fs scope registration...");
        return Ok(path_str);
    }

    register_fs_scope(app, path_str.clone())?;
    Ok(path_str)
}

#[command]
pub fn import_selected_folder(app: AppHandle, source_path: &str) -> Result<String, String> {
    // 1️⃣ Get the app data directory (works on all platforms)
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to locate AppDataDir: {}", e))?
        .to_path_buf();

    // 2️⃣ Create "Imported" folder inside the app data directory
    let imported_dir = app_dir.join("imported");
    if !imported_dir.exists() {
        std::fs::create_dir_all(&imported_dir)
            .map_err(|e| format!("Failed to create Imported folder: {}", e))?;
    }

    // 3️⃣ Copy all files/folders recursively
    let source = std::path::PathBuf::from(source_path);
    if !source.exists() {
        return Err("Source path does not exist".to_string());
    }

    // Destination = AppDataDir/Imported/<source_folder_name>
    let folder_name = source
        .file_name()
        .ok_or_else(|| "Invalid folder name".to_string())?;
    let destination = imported_dir.join(folder_name);

    copy_dir_all(&source, &destination)?;

    println!("✅ Imported to: {:?}", destination);
    Ok(destination.to_string_lossy().to_string())
}

/// Helper to copy directories recursively
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
/// 📝 Appends or creates imported.json inside AppData/data/
fn save_imported_record(app: &AppHandle, imported: &Imported) -> Result<(), String> {
    let app_data_dir = app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    let data_dir = app_data_dir.join("data");
    fs::create_dir_all(&data_dir).map_err(|e| format!("Failed to create data dir: {}", e))?;

    let imported_json_path = data_dir.join("imported.json");

    let mut imports: Vec<Imported> = if imported_json_path.exists() {
        let content = fs::read_to_string(&imported_json_path)
            .map_err(|e| format!("Failed to read imported.json: {}", e))?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        vec![]
    };
    let import_ = imported.clone();
    // Avoid duplicates by checking existing paths
    if !imports.iter().any(|i| i.path == import_.path) {
        imports.push(import_); // here .push expects self not &self
    }

    let updated_json = serde_json::to_string_pretty(&imports)
        .map_err(|e| format!("Failed to serialize imported.json: {}", e))?;

    fs::write(&imported_json_path, updated_json)
        .map_err(|e| format!("Failed to write imported.json: {}", e))?;

    println!("📁 Updated imported.json with {:?}", imported.path);
    Ok(())
}