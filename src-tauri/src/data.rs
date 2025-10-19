use tokio::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager,command};

#[command]
pub async fn clear_data(app: AppHandle) -> Result<(), String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let data_dir: PathBuf = app_dir.join("data");

    if data_dir.exists() {
        fs::remove_dir_all(&data_dir)
            .await
            .map_err(|e| format!("Failed to delete data folder: {}", e))?;
    }

    Ok(())
}

#[command]
pub async fn create_data_dir(app: AppHandle) -> Result<(), String> {
    let app_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let data_dir = app_dir.join("data");

    fs::create_dir_all(data_dir).await.map_err(|e| format!("Failed to create Data <dir>: {}", e))?;
    Ok(())
}

#[command]
pub async fn reset_data_dir(app: AppHandle) -> Result<(), String> {
    clear_data(app.clone()).await?;
    create_data_dir(app).await?;
    Ok(())
}
