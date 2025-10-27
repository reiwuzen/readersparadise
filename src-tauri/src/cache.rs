use serde_json::to_string_pretty;
use tokio::{fs as tokio_fs};
use tauri::{AppHandle,command};

use crate::{book::Series, helper::get_app_cache_dir};

#[command]
pub async fn write_search_res_cache(vec_series: Vec<Series>, app: AppHandle) -> Result<(), String> {
    // Get cache directory
    let cache_dir = get_app_cache_dir(app).map_err(|e| format!("Failed to get cache dir: {}", e))?;
    let series_dir = cache_dir.join("series");

    // Ensure base dir exists
    tokio_fs::create_dir_all(&series_dir)
        .await
        .map_err(|e| format!("Failed to create base cache dir: {}", e))?;

    // Loop through all series and write each to its own file
    for series in vec_series {
        let pa = series_dir.join(&series.title);
        tokio_fs::create_dir_all(&pa)
            .await
            .map_err(|e| format!("Failed to create series dir: {}", e))?;

        let path = pa.join("info.json");
        let contents = to_string_pretty(&series).map_err(|e| format!("JSON serialization error: {}", e))?;

        tokio_fs::write(&path, contents)
            .await
            .map_err(|e| format!("Failed to write cache file: {}", e))?;
    }

    Ok(())
}
