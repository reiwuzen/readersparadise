use regex::Regex;
use reqwest::Client;
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use std::{error::Error, fs, path::Path};
use tauri::AppHandle;
use tokio::{fs as tokio_fs, select};
use urlencoding::encode;
use crate::sources::get_sources_backend;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Filter {
    pub main_div_selectors: String,
    pub starts: Vec<String>,
    pub title_selector: Option<String>,
    pub link_selector: Option<String>,
    pub cover_image_selector: Option<String>,
    pub cover_image_attr: Option<String>,
    pub latest_chapter: Option<String>,
    pub chapter_selector: Option<String>,
    pub chapter_attr: Option<String>,
    pub chapter_number_regex: Option<String>,
    pub dynamic_page_pattern: Option<String>,
    pub chapter_id_regex: Option<String>,
    pub max_pages: Option<usize>,

    // 🆕 New for API-based sources (like ManhuaPlus)
    pub chapter_api: Option<String>,
    pub chapter_api_method: Option<String>,
    pub response_type: Option<String>, // "html", "json", "html_json"
    pub response_html_field: Option<String>, // e.g. "html"
    pub image_list_selector: Option<String>, // e.g. "img"
    pub image_attr_list: Option<Vec<String>>, // e.g. ["data-src", "src"]
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
    let sources = get_sources_backend(app).map_err(|e| e.to_string())?;

    let client = Client::builder()
        .user_agent("Mozilla/5.0 (compatible; RustScraper/1.0)")
        .build()
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();

    for source in sources.iter().filter(|s| s.is_selected) {
        let search_url = source
        .search_pattern
        .replace("{query}", &encode(&query));
        let resp = client
            .get(&search_url)
            .send()
            .await
            .map_err(|e| e.to_string())?;
        let html = resp.text().await.map_err(|e| e.to_string())?;
        let doc = Html::parse_document(&html);
        if source.r#type == "dynamic" {
            let main_div_selector = Selector::parse(&source.filters.main_div_selectors).unwrap();
            for each_element in doc.select(&main_div_selector) {
                let each_search_selector = match &source.filters.title_selector {
                    Some(sel) => Selector::parse(sel)
                        .map_err(|_| format!("Invalid title selector: {}", sel))?,
                    None => continue, // skip this source if no selector
                };
                if let Some(each_search) = each_element.select(&each_search_selector).next() {
                    let title = each_search.value().attr("title").unwrap_or("").to_string();
                    let href = each_search.value().attr("href").unwrap_or("").to_string();
                    let cover_selector = match &source.filters.cover_image_selector {
                        Some(sel) => Selector::parse(sel)
                            .map_err(|_| format!("Invalid title selector: {}", sel))?,
                        None => continue,
                    };
                    let cover_postpend = each_search
                        .select(&cover_selector)
                        .next()
                        .and_then(|z| {
                            // Only call attr if image_attr is Some
                            source
                                .filters
                                .cover_image_attr
                                .as_deref()
                                .and_then(|attr| z.value().attr(attr))
                        })
                        .unwrap_or("")
                        .to_string();
                    let cover_src =
                        format!("{}{}", &source.url, cover_postpend.trim_start_matches('/'));
                    let latest_chapter_selector = match &source.filters.latest_chapter {
                        Some(sel) => Selector::parse(sel)
                            .map_err(|_| format!("Invalid title selector: {}", sel))?,
                        None => continue,
                    };
                    let latest_chapter = each_element
                        .select(&latest_chapter_selector)
                        .last()
                        .map(|el| el.text().collect::<Vec<_>>().join("").trim().to_string());

                    results.push(SearchResult {
                        source_name: source.name.clone(),
                        manga_title: title,
                        cover_img: Some(cover_src),
                        desc: Some("".to_string()),
                        url: href,
                        latest_chapter: latest_chapter,
                    });
                }
            }
        }
    }

    println!("Found {} results", results.len());
    Ok(results)
}
