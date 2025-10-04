//cmd.rs
#[allow(unused_imports)]
use tauri::command;
use std::fs;
use std::path::{Path, PathBuf};
use tauri_plugin_dialog::DialogExt;

#[derive(serde::Serialize)]
pub struct MangaFolder {
    pub name: String,        // folder name (manga title)
    pub path: String,        // folder full path
    pub cover: Option<Vec<u8>>, // first image bytes as cover
    pub images: Vec<String>, // list of image paths
}

#[command]
pub fn read_image_bytes(path: String) -> Result<Vec<u8>, String> {
    let path_buf = PathBuf::from(path);
    fs::read(path_buf).map_err(|e| format!("Failed to read image: {}", e))
}
#[command]
pub async fn open_folder_and_list_items(app: tauri::AppHandle) -> Result<MangaFolder, String> {
    // open system folder picker
    let folder = app.dialog().file().blocking_pick_folder();

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

    // Read all image files
    let mut image_paths: Vec<String> = fs::read_dir(&folder_path)
        .map_err(|e| format!("Failed to read folder: {}", e))?
        .filter_map(|entry| {
            entry.ok().and_then(|e| {
                let path = e.path();
                let ext = path.extension()?.to_string_lossy().to_lowercase();
                if ["jpg", "jpeg", "png", "webp", "bmp"].contains(&ext.as_str()) {
                    Some(path.to_string_lossy().to_string())
                } else {
                    None
                }
            })
        })
        .collect();

    // Sort alphabetically so pages appear in order
    image_paths.sort();

    // Get cover (first image bytes)
    let cover = if let Some(first) = image_paths.first() {
        match fs::read(first) {
            Ok(bytes) => Some(bytes),
            Err(_) => None,
        }
    } else {
        None
    };

    // Folder name as manga title
    let folder_name = folder_path
        .file_name()
        .unwrap_or_else(|| std::ffi::OsStr::new("Untitled"))
        .to_string_lossy()
        .to_string();

    Ok(MangaFolder {
        name: folder_name,
        path: folder_path.to_string_lossy().to_string(),
        cover,
        images: image_paths,
    })
}

