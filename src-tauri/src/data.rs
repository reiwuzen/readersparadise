use std::path::PathBuf;
use tauri::{command, AppHandle, Manager};
use tokio::fs;

use crate::{get_app, helper::{get_app_cache_dir, get_app_data_dir, get_app_download_dir,get_app_source_dir}};

/// Generic function to clear a folder
async fn clear_dir(dir: PathBuf, name: &str) -> Result<(), String> {
    if dir.exists() {
        fs::remove_dir_all(&dir)
            .await
            .map_err(|e| format!("Failed to delete {} folder: {}", name, e))?;
    }
    Ok(())
}

/// Generic function to create a folder
async fn create_dir(dir: PathBuf, name: &str) -> Result<(), String> {
    fs::create_dir_all(&dir)
        .await
        .map_err(|e| format!("Failed to create {} folder: {}", name, e))?;
    Ok(())
}

/// Generic function to reset a folder
async fn reset_dir(dir: PathBuf, name: &str) -> Result<(), String> {
    clear_dir(dir.clone(), name).await?;
    create_dir(dir, name).await?;
    Ok(())
}

// ------------------ Data ------------------

#[command]
pub async fn clear_data(app: AppHandle) -> Result<(), String> {
    let data_dir = get_app_data_dir(app)?;
    clear_dir(data_dir, "data").await
}

#[command]
pub async fn create_data_dir(app: AppHandle) -> Result<(), String> {
    let data_dir =get_app_data_dir(app)?;
    create_dir(data_dir, "data").await
}

#[command]
pub async fn reset_data_dir(app: AppHandle) -> Result<(), String> {
    let data_dir =get_app_data_dir(app)?;
    reset_dir(data_dir, "data").await
}

// ------------------ Downloads ------------------

#[command]
pub async fn clear_downloads(app: AppHandle) -> Result<(), String> {
    let download_dir = get_app_download_dir(app)?;
    clear_dir(download_dir, "downloads").await
}

#[command]
pub async fn create_downloads_dir(app: AppHandle) -> Result<(), String> {
    let download_dir = get_app_download_dir(app)?;
    create_dir(download_dir, "downloads").await
}

#[command]
pub async fn reset_downloads_dir(app: AppHandle) -> Result<(), String> {
    let download_dir = get_app_download_dir(app)?;
    reset_dir(download_dir, "downloads").await
}

// ------------------ Cache ------------------

#[command]
pub async fn clear_cache(app: AppHandle) -> Result<(), String> {
    let cache_dir = get_app_cache_dir(app)?;
    clear_dir(cache_dir, "cache").await
}

#[command]
pub async fn create_cache_dir(app: AppHandle) -> Result<(), String> {
    let cache_dir = get_app_cache_dir(app)?;
    create_dir(cache_dir, "cache").await
}

#[command]
pub async fn reset_cache_dir(app: AppHandle) -> Result<(), String> {
    let cache_dir = get_app_cache_dir(app)?;
    reset_dir(cache_dir, "cache").await
}

// ------------------ Src ------------------

#[command]
pub async fn clear_src(app: AppHandle) -> Result<(), String> {
    let src_dir = get_app_source_dir(app)?;
    clear_dir(src_dir, "source").await
}

#[command]
pub async fn create_src_dir(app: AppHandle) -> Result<(), String> {
    let src_dir = get_app_source_dir(app)?;
    create_dir(src_dir, "source").await
}

#[command]
pub async fn reset_src_dir(app: AppHandle) -> Result<(), String> {
    let src_dir = get_app_source_dir(app)?;
    reset_dir(src_dir, "source").await
}

#[command]
pub async fn get_app_path(app: AppHandle) -> Result<String, String> {
    let app_dir = get_app!(app); // assuming this returns PathBuf
    let path_str = app_dir
        .to_str()
        .ok_or("Failed to convert app path to string")?; // convert Path to &str safely
    Ok(path_str.to_string())
}