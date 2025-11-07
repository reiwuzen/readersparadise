use std::path::PathBuf;
use std::fs;
use crate::book::SeriesStatusEnum;
// use crate::models::{BookInfo, EachChapter};
// use crate::sources::{Conf, Sel};
use scraper::ElementRef;
// use scraper::{Html, Selector};
// use tauri::http::status;
use tauri::{AppHandle,Manager};


/// get val from element if Some(attr) then its value
/// else the text from element
pub fn get_val(el: &ElementRef, attr: Option<&str>) -> String {
    if let Some(attribute) = attr {
        if let Some(val) = el.value().attr(attribute) {
            return val.to_string();
        }
    }
    // Fallback to text content
    el.text().collect::<String>().trim().to_string()
}
pub fn as_opt_str(opt: &Option<String>) -> Option<&str> {
    opt.as_deref()
}

/// Joins two strings safely, trimming leading '/' from the second part.
/// Example: format_join("https://example.com", "/path") → "https://example.com/path"
pub fn format_join(a: &str, b: &str) -> String {
    format!("{}{}", a, b.trim_start_matches('/'))
}

///
///
///
pub fn get_direct_text(el: &ElementRef) -> String {
    el.children()
        .filter_map(|node| node.value().as_text())
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join(" ")
}

//
pub fn clean_description(s: &str, unwanted: Option<&str>) -> String {
    let unwanted =
        unwanted.unwrap_or("You are reading  chapters on www.mgeko.cc fastest updating comic site");
    s.replace(unwanted, "").trim().to_string()
}

/// function to clean images vec
pub fn clean_chapter_images(images: Vec<String>, unwanted: Option<&str>) -> Vec<String> {
    let unwanted = unwanted.unwrap_or("").trim();
    images
        .into_iter()
        .filter(|img| {
            let trimmed = img.trim();
            !trimmed.is_empty() && (unwanted.is_empty() || trimmed != unwanted)
        })
        .map(|img| img.trim().to_string())
        .collect()
}


#[macro_export]
macro_rules! wrap_err {
    ($e:expr, $msg:expr) => {
        $e.map_err(|err| format!("{}: {}", $msg, err))
    };
}

#[macro_export]
macro_rules! get_app {
    ($e:expr) => {
        $e.path()
            .app_data_dir()
            .map_err(|e| format!("Failed to get app data dir: {}", e))?
    };
}

/// converts to string stringify
pub fn pls_stringify(i: &str)->String{
    String::from(i)
}

/// map to SeriesSites Enum
pub fn map_series_sites_to_enum(status: String) -> SeriesStatusEnum{
     match status.to_lowercase().as_str() {
    "ongoing" => SeriesStatusEnum::Ongoing,
    "completed" => SeriesStatusEnum::Completed,
    "stopped" => SeriesStatusEnum::Stopped,
    "hiatus" => SeriesStatusEnum::Hiatus,
    _ => SeriesStatusEnum::Ongoing,
}
}

/// Get (and create) the app's config directory: app_data/config
pub fn get_app_config_dir(app: AppHandle) -> Result<PathBuf, String> {
    let base = get_app!(app);
    let path = base.join("config");
    fs::create_dir_all(&path)
        .map_err(|e| format!("Failed to create config dir: {}", e))?;
    Ok(path)
}

/// Get (and create) the app's data directory: app_data/data
pub fn get_app_data_dir(app: AppHandle) -> Result<PathBuf, String> {
    let base = get_app!(app);
    let path = base.join("data");
    fs::create_dir_all(&path)
        .map_err(|e| format!("Failed to create data dir: {}", e))?;
    Ok(path)
}

/// Get (and create) the app's cache directory: app_data/cache
pub fn get_app_cache_dir(app: AppHandle) -> Result<PathBuf, String> {
    let base = get_app!(app);
    let path = base.join("cache");
    fs::create_dir_all(&path)
        .map_err(|e| format!("Failed to create cache dir: {}", e))?;
    Ok(path)
}

/// Get (and create) the app's internal downloads directory: app_data/downloads
pub fn get_app_download_dir(app: AppHandle) -> Result<PathBuf, String> {
    let base = get_app!(app);
    let path = base.join("downloads");
    fs::create_dir_all(&path)
        .map_err(|e| format!("Failed to create downloads dir: {}", e))?;
    Ok(path)
}

///
pub fn get_app_source_dir(app: AppHandle) -> Result<PathBuf, String> {
    let base = get_app!(app);
    let path = base.join("source");
    fs::create_dir_all(&path)
        .map_err(|e| format!("Failed to create source dir: {}", e))?;
    Ok(path)
}

/// Get the system-level user downloads directory (does NOT create)
pub fn get_user_downloads_dir(app: AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .download_dir()
        .map_err(|e| format!("Failed to get system downloads dir: {}", e))?;
    Ok(dir)
}


/// Get (and create) the app's internal temp directory: app_data/temp
pub fn get_app_temp_dir(app: AppHandle) -> Result<PathBuf, String> {
    let base = get_app!(app);
    let path = base.join("temp");
    fs::create_dir_all(&path)
        .map_err(|e| format!("Failed to create temp dir: {}", e))?;
    Ok(path)
}
//
