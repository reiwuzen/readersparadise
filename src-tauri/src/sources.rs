use serde_json::Value;
use std::{fs, path::PathBuf};
use reqwest::Client;
use futures::stream::{FuturesUnordered, StreamExt};
use tokio::fs as tokio_fs;
use tauri::AppHandle;
use tauri::Manager;
use serde::{Deserialize, Serialize};
use tokio::io::AsyncWriteExt;

//crates
use crate::models::{SearchResults, Selectors, Sources, BookInfo, EachChapter};
use crate::mgeko::Mgeko;
use crate::helper::{get_app_download_dir,};
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
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct DownloadChapter{
    chapter_name: Option<String>,
    chapter_number: Option<String>,
    chapter_links: Vec<String>,
}
/// 
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct DownloadInfo{
    name: String,
    chapters: Vec<DownloadChapter>,
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
    
    let base_dir = get_app_download_dir(app)?;
    let book_dir = base_dir.join(format!("books/{}", book_name));
    let folder_path = book_dir.join(&ch_no);
    let json_path = book_dir.join("info.json");

    tokio_fs::create_dir_all(&folder_path)
        .await
        .map_err(|e| format!("Failed to create folder {}: {}", folder_path.display(), e))?;

    let total_digits = ch_urls.len().to_string().len().max(3);
    let client = Client::new();

    // FuturesUnordered to parallelize downloads (limit concurrency manually)
    let mut tasks = FuturesUnordered::new();
    let concurrency_limit = 5; // tune this depending on bandwidth and server limits

    let mut local_links = Vec::with_capacity(ch_urls.len());

    for (i, url) in ch_urls.iter().enumerate() {
        let client = client.clone();
        let folder_path = folder_path.clone();
        let base_dir = base_dir.clone();

        // Push task into the concurrent stream
        tasks.push(async move {
            let resp = client.get(url)
                .send()
                .await
                .map_err(|e| format!("Failed to download {}: {}", url, e))?;

            let bytes = resp
                .bytes()
                .await
                .map_err(|e| format!("Failed to read bytes: {}", e))?;

            let file_name = format!("{:0width$}.jpg", i + 1, width = total_digits);
            let file_path = folder_path.join(&file_name);

            let mut file = tokio_fs::File::create(&file_path)
                .await
                .map_err(|e| format!("Failed to create file {}: {}", file_path.display(), e))?;
            file.write_all(&bytes)
                .await
                .map_err(|e| format!("Failed to write file {}: {}", file_path.display(), e))?;

            // Return relative link
            let rel = file_path
                .strip_prefix(&base_dir)
                .unwrap_or(&file_path)
                .to_string_lossy()
                .to_string();
            Ok::<String, String>(rel)
        });

        // Optional: throttle concurrency manually
        if tasks.len() >= concurrency_limit {
            if let Some(result) = tasks.next().await {
                result?; // propagate errors early
            }
        }
    }

    // Drain remaining tasks
    while let Some(result) = tasks.next().await {
        local_links.push(result?);
    }

    // Build / update info.json
    let mut info = if json_path.exists() {
        let data = tokio_fs::read_to_string(&json_path)
            .await
            .unwrap_or_default();
        serde_json::from_str::<DownloadInfo>(&data).unwrap_or(DownloadInfo {
            name: book_name.clone(),
            chapters: vec![],
        })
    } else {
        DownloadInfo {
            name: book_name.clone(),
            chapters: vec![],
        }
    };

    let new_chapter = DownloadChapter {
        chapter_name: Some(format!("Chapter {}", ch_no)),
        chapter_number: Some(ch_no.clone()),
        chapter_links: local_links,
    };

    if let Some(existing) = info.chapters.iter_mut().find(|c| c.chapter_number == Some(ch_no.clone())) {
        *existing = new_chapter;
    } else {
        info.chapters.push(new_chapter);
    }

    let json_str = serde_json::to_string_pretty(&info)
        .map_err(|e| format!("Failed to serialize JSON: {}", e))?;
    tokio_fs::write(&json_path, json_str)
        .await
        .map_err(|e| format!("Failed to write JSON file {}: {}", json_path.display(), e))?;

    Ok(())
}