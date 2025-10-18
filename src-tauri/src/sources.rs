use crate::discover::Source;
use serde_json::Value;
use std::{fs, path::PathBuf};
use tauri::AppHandle;
use tauri::Manager;

fn get_sources_frontend(sources: Value) -> Result<String, String> {
    serde_json::to_string_pretty(&sources).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn check_sources(sources: Value, app: AppHandle) -> Result<(), String> {
    // Get app data directory
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let data_dir = app_dir.join("data");

    // Create the data directory if it doesn't exist

    // Path to sources.json
    let sources_dir = data_dir.join("sources");
    fs::create_dir_all(&sources_dir)
        .map_err(|e| format!("Failed to create data directory: {}", e))?;
    let sources_json = sources_dir.join("sources.json");

    if !sources_json.is_file() {
        // File doesn't exist, create it
        let json_str = get_sources_frontend(sources)?;

        fs::write(&sources_json, &json_str)
            .map_err(|e| format!("Failed to write sources.json: {}", e))?;
    }
    Ok(())
}

pub fn get_sources_backend(app: AppHandle) -> Result<Vec<Source>, String> {
    let app_dir = app
        .clone()
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    let data_dir = app_dir.join("data");

    let sources_dir = data_dir.join("sources");
    fs::create_dir_all(&sources_dir)
        .map_err(|e| format!("Failed to create data directory: {}", e))?;
    let sources_json = sources_dir.join("sources.json");

    let json_sources_str = fs::read_to_string(&sources_json)
        .map_err(|e| format!("Failed to read sources.json: {}", e))?;

    // Deserialize directly into Vec<Source>
    let sources: Vec<Source> = serde_json::from_str(&json_sources_str)
        .map_err(|e| format!("Failed to parse sources.json: {}", e))?;

    Ok(sources)
}