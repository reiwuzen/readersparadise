use serde_json::Value;
use std::{fs, path::PathBuf};
use tokio::fs as tokio_fs;
use tauri::AppHandle;
use tauri::Manager;
use serde::{Deserialize, Serialize};
use tokio::io::AsyncWriteExt;
use reqwest;

//crates
use crate::models::{SearchResults, Selectors, Sources, BookInfo};
use crate::mgeko::Mgeko;
use crate::wrap_err;

//traits
pub trait F {
    fn is_selected(&self) -> bool;
    fn is_nsfw(&self) -> bool;
    fn is_main(&self) -> bool;
    fn is_fav(&self) -> bool;
    fn is_all(&self) -> bool;
}


pub trait SrcLoad{
    fn load_all(app:&AppHandle) -> Result<Mgeko, String>;
}

//struct
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ESel {
    pub sel: String,
    pub attr: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct StatsSel {
    pub sel: String,
    pub latest_chapter_sel: ESel,
    pub update_sel: Option<ESel>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SearchSel {
    pub main_sel: String,
    pub link_sel: ESel,
    pub title_sel: ESel,
    pub cover_img_sel: ESel,
    pub authors_sel: ESel,
    pub stats_sel: StatsSel,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct AltTitleSel {
    pub sel: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct BookTitleSel {
    pub sel: String,
    pub atl_title_sel: Option<AltTitleSel>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ChapterLink {
    pub sel: String,
    pub attr: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ChapterNumber {
    pub sel: String,
    pub update: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ChapterList {
    pub sel: String,
    pub link: ChapterLink,
    pub number: ChapterNumber,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct BookStats {
    pub sel: String,
    pub latest_chapter_sel: ESel,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct BookSel {
    pub cover_img_sel: ESel,
    pub title_sel: BookTitleSel,
    pub author_sel: ESel,
    pub stats: BookStats,
    pub update_info: ESel,
    pub categories: ESel,
    pub desc: ESel,
    pub chapter_list: ChapterList,
}

// --- Selectors wrapper ---
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Sel {
    pub name: String,
    pub url: String,
    pub search_url: String,
    pub search_sel: SearchSel,
    pub book_sel: BookSel,
}

// --- Config struct ---
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Conf {
    pub name: String,
    pub url: String,
    pub search_url: String,
    pub is_selected: bool,
    pub is_nsfw: bool,
    pub is_main: bool,
    pub is_fav: bool,
    pub is_all: bool,
}
///
/// 


#[tauri::command]
pub async fn download_1_chapter(
    book_name: String,
    ch_no: String,
    ch_urls: Vec<String>,
    app: AppHandle,
) -> Result<(), String> {
    let app_dir = wrap_err!(app.path().app_data_dir(), "Failed to get app data dir")?;
    let data_download_dir = app_dir.join("data/download"); // <-- semicolon fixed

    // Create folder: data/download/books/<book_name>/<ch_no>/
    let folder_path = data_download_dir.join(format!("books/{}/{}", book_name, ch_no));

    tokio_fs::create_dir_all(&folder_path)
        .await
        .map_err(|e| format!("Failed to create folder {}: {}", folder_path.display(), e))?;

    let total_digits = ch_urls.len().to_string().len().max(3); // dynamic padding, minimum 3 digits

    for (i, url) in ch_urls.iter().enumerate() {
        let resp = reqwest::get(url)
            .await
            .map_err(|e| format!("Failed to download {}: {}", url, e))?;
        let bytes = resp
            .bytes()
            .await
            .map_err(|e| format!("Failed to read bytes from {}: {}", url, e))?;

        let file_name = format!("{:0width$}.jpg", i + 1, width = total_digits);
        let file_path = folder_path.join(file_name);

        let mut file = tokio_fs::File::create(&file_path)
            .await
            .map_err(|e| format!("Failed to create file {}: {}", file_path.display(), e))?;
        file.write_all(&bytes)
            .await
            .map_err(|e| format!("Failed to write to file {}: {}", file_path.display(), e))?;
    }

    Ok(())
}