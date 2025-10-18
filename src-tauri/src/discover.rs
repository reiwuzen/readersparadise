use reqwest::Client;
use scraper::{Html, Selector};

use crate::sources::get_sources_backend;
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::{error::Error, fs, path::Path};
use tauri::AppHandle;
use tokio::fs as tokio_fs;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Filter {
    pub selectors: Vec<String>,
    pub starts: Vec<String>,
    pub title_selector: Option<String>,
    pub link_selector: Option<String>,
    pub image_selector: Option<String>,
    pub image_attr: Option<String>,           // e.g., "data-src"
    pub chapter_selector: Option<String>,     // CSS selector for latest chapter link
    pub chapter_attr: Option<String>,         // Attribute for chapter URL
    pub chapter_number_regex: Option<String>, // Regex to extract chapter number
    pub dynamic_page_pattern: Option<String>,
    pub chapter_id_regex: Option<String>,
    pub max_pages: Option<usize>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Source {
    pub name: String,
    pub options: Vec<String>,
    pub is_nsfw: bool,
    pub is_selected: bool,
    pub r#type: String,
    pub url: String,
    pub search_pattern: String,
    pub filters: Filter,
}

#[derive(Serialize, Clone, Debug)]
pub struct SearchResult {
    pub source_name: String,
    pub manga_title: String,
    pub cover_img: Option<String>,
    pub desc: Option<String>,
    pub url: String,
    pub latest_chapter: Option<String>,
}

#[derive(Serialize, Clone)]
pub struct ChapterImageResult {
    pub cover: Option<String>,
    pub pages: Vec<String>,
    pub local_cache_paths: Vec<String>,
    pub chapter_number: Option<String>,
}

#[tauri::command]
pub async fn search_manga(query: String, app: AppHandle) -> Result<Vec<SearchResult>, String> {
    // let query = "I am".to_string();
    let sources = get_sources_backend(app).map_err(|e| e.to_string())?;

    let client = Client::builder()
        .user_agent("Mozilla/5.0 (compatible; RustScraper/1.0)")
        .build()
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();

    for source in sources.iter().filter(|s| s.is_selected) {
        let url = source
            .search_pattern
            .replace("{query}", &urlencoding::encode(&query));
        let html = client
            .get(&url)
            .send()
            .await
            .map_err(|e| e.to_string())?
            .text()
            .await
            .map_err(|e| e.to_string())?;

        let document = Html::parse_document(&html);

        // Use outer container that wraps the full manga card
        let container_selector = Selector::parse("#main .grid > div").map_err(|e| e.to_string())?;

        for node in document.select(&container_selector) {
            // Title
            let title_selector = source.filters.title_selector.as_deref().unwrap_or("");
            let title = Selector::parse(title_selector)
                .ok()
                .and_then(|sel| node.select(&sel).next())
                .map(|e| e.text().collect::<Vec<_>>().join("").trim().to_string());

            // Manga URL
            let link_selector = source.filters.link_selector.as_deref().unwrap_or("");
            let link = Selector::parse(link_selector)
                .ok()
                .and_then(|sel| node.select(&sel).next())
                .and_then(|e| e.value().attr("href").map(|h| h.to_string()));

            // Cover image
            let image_selector = source.filters.image_selector.as_deref().unwrap_or("");
            let img_attr = source.filters.image_attr.as_deref().unwrap_or("src");
            let cover_img = Selector::parse(image_selector)
                .ok()
                .and_then(|sel| node.select(&sel).next())
                .and_then(|e| e.value().attr(img_attr))
                .map(|v| {
                    if v.starts_with("http") {
                        v.to_string()
                    } else {
                        format!("{}{}", source.url.trim_end_matches('/'), v)
                    }
                });

            // Latest chapter
            let chapter_selector = source.filters.chapter_selector.as_deref().unwrap_or("");
            let chapter_attr = source.filters.chapter_attr.as_deref().unwrap_or("href");
            let chapter_number_regex = source
                .filters
                .chapter_number_regex
                .as_deref()
                .unwrap_or("Chapter (\\d+)");
            let (chapter_url, latest_chapter) = Selector::parse(chapter_selector)
                .ok()
                .and_then(|sel| node.select(&sel).next())
                .map(|e| {
                    let href = e.value().attr(chapter_attr).unwrap_or("").to_string();

                    let text_content = e.text().collect::<Vec<_>>().join(""); // store temporary
                    let chap_number = regex::Regex::new(chapter_number_regex)
                        .ok()
                        .and_then(|re| re.captures(&text_content))
                        .and_then(|cap| cap.get(1))
                        .map(|m| m.as_str().to_string());

                    (href, chap_number)
                })
                .unwrap_or((String::new(), None));

            if let Some(url) = link {
                results.push(SearchResult {
                    source_name: source.name.clone(),
                    manga_title: title.unwrap_or_default(),
                    cover_img,
                    desc: None,
                    url,
                    latest_chapter,
                });
            }
        }
    }

    println!("Found {} results", results.len());
    Ok(results)
}
