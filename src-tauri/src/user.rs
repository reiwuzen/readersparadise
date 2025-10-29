use std::{fs, path::PathBuf};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::{
    // App,
     AppHandle,
    //   Manager
    };
use crate::{
    // get_app,
     helper::{get_app_config_dir,
    //  get_app_data_dir, get_app_download_dir, 
     get_user_downloads_dir}};

// --- your enums and structs ---
#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum Theme {
    Dark,
    Light,
    BlueGrey,
    Custom,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum ReaderMode {
    TopToBottom,
    BottomToTop,
    LeftToRight,
    RightToLeft,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum PageLayout {
    Single,
    Double,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct DownloadConf {
    pub path: PathBuf,
    pub concurrent_limit: i32,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ReaderConf {
    pub page_layout: PageLayout,
    pub mode: ReaderMode,
    pub keyboard_shortcuts: bool,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct UserConf {
    pub is_nsfw: bool,
    pub theme: Theme,
    pub download_path: PathBuf,
    pub concurrent_download_limit: u64,
    pub reader: ReaderConf,
}

// -------------------------------------------
// Create default config file if not present
// -------------------------------------------
 fn create_default_user_config(app: AppHandle) -> Result<(), String> {
    let config_dir = get_app_config_dir(app.clone())?;
    let config_path = config_dir.join("user.json");

    // Create directories if missing
    if !config_dir.exists() {
        fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
    }

    // Prepare defaults
    let reader = ReaderConf {
        page_layout: PageLayout::Single,
        mode: ReaderMode::TopToBottom,
        keyboard_shortcuts: true,
    };

    // let download = DownloadConf {
    //     path: get_app_download_dir(app.clone())?,
    //     concurrent_limit: 3,
    // };

    let user_conf = UserConf {
        is_nsfw: false,
        theme: Theme::Dark,
        download_path: get_user_downloads_dir(app.clone()).unwrap_or_default(),
        concurrent_download_limit: 10,

        reader,
    };

    // Serialize to JSON and save
    let json = serde_json::to_string_pretty(&user_conf).map_err(|e| e.to_string())?;
    fs::write(&config_path, json).map_err(|e| e.to_string())?;

    Ok(())
}

// --- the command itself ---
#[tauri::command]
pub fn get_user_config(app: AppHandle) -> Result<UserConf, String> {
    let config_dir = get_app_config_dir(app.clone())?;
    let user_config_path = config_dir.join("user.json");

    // If missing, create it first1
    if !user_config_path.exists() {
        create_default_user_config(app.clone())?;
    }

    // Read and deserialize
    let user_data = fs::read_to_string(&user_config_path)
        .map_err(|e| format!("Failed to read user config: {}", e))?;

    let config: UserConf = serde_json::from_str(&user_data)
        .map_err(|e| format!("Failed to parse user config: {}", e))?;

    Ok(config)
}


#[tauri::command]
pub fn update_user_config(app: AppHandle, updates: Value) -> Result<(), String> {
    let config_dir = get_app_config_dir(app).map_err(|e| e.to_string())?;
    let user_config = config_dir.join("user.json");

    // Read existing config or start empty
    let mut current_config: Value = if user_config.exists() {
        let data = fs::read_to_string(&user_config)
            .map_err(|e| format!("Failed to read user config: {}", e))?;
        serde_json::from_str(&data).unwrap_or(Value::Object(serde_json::Map::new()))
    } else {
        Value::Object(serde_json::Map::new())
    };

    // Merge updates recursively
    merge_json(&mut current_config, &updates);

    // Write updated JSON
    fs::write(
        &user_config,
        serde_json::to_string_pretty(&current_config)
            .map_err(|e| format!("Failed to serialize config: {}", e))?,
    )
    .map_err(|e| format!("Failed to write user config: {}", e))?;

    Ok(())
}

/// Recursively merge `b` into `a`
fn merge_json(a: &mut Value, b: &Value) {
    match (a, b) {
        (Value::Object(a_map), Value::Object(b_map)) => {
            for (k, v) in b_map {
                merge_json(a_map.entry(k.clone()).or_insert(Value::Null), v);
            }
        }
        (a_slot, b_val) => {
            *a_slot = b_val.clone();
        }
    }
}