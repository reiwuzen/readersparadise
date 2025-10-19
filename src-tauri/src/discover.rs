use crate::sources::get_sources_backend;
use regex::Regex;
use reqwest::Client;
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use std::{error::Error, fs, path::Path};
use tauri::AppHandle;
use tokio::{fs as tokio_fs, select};
use urlencoding::encode;

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
        let search_url = source.search_pattern.replace("{query}", &encode(&query));
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
    Ok(results)
}

#[tauri::command]
pub async fn info_manga(_app: AppHandle, url: String) -> Result<(), String> {
    let client = Client::builder()
        .user_agent("Mozilla/5.0 (compatible; RustScraper/1.0)")
        .build()
        .map_err(|e| e.to_string())?;

    let resp = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to get the url: {}", e))?;

    let html = resp.text().await.map_err(|e| e.to_string())?;
    let doc = Html::parse_document(&html);

    let info_selector = Selector::parse("aside .y6x11p").unwrap();
    let span_selector = Selector::parse("span.dt").unwrap();
    let author_selector = Selector::parse("span.dt > a").unwrap();
    let tag_selector = Selector::parse("div.mt-15  a.label").unwrap();
    let desc_selector = Selector::parse("article div#syn-target").unwrap();
    let mut authors = String::new();
    let mut status = String::new();
    let mut manga_type = String::new();
    let mut bookmarks = String::new();
    let mut created = String::new();
    let mut updated = String::new();
    let mut desc = String::new();
    let mut tags: Vec<String> = Vec::new();

    let desc_text = doc
        .select(&desc_selector)
        .next()
        .unwrap();

    desc = desc_text
        .text()
        .collect::<String>()
        .trim()
        .to_string();

    for tag in doc.select(&tag_selector) {
        let each_tag = tag.text().collect::<String>().trim().to_string();
        tags.push(each_tag);
    }

    for element in doc.select(&info_selector) {
        // join all visible text to help identify what this row is about
        let header_text = element
            .text()
            .collect::<String>()
            .replace('\n', "")
            .trim()
            .to_string();

        // collect all <span class="dt"> text
        let value_text = element
            .select(&span_selector)
            .next()
            .map(|v| v.text().collect::<String>().trim().to_string())
            .unwrap_or_default();

        // collect all <a> text under <span.dt> (in case multiple authors)
        let author_links: Vec<String> = element
            .select(&author_selector)
            .map(|a| a.text().collect::<String>().trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        if header_text.contains("Authors") {
            // handle multiple authors gracefully
            authors = if !author_links.is_empty() {
                author_links.join(", ")
            } else {
                value_text.clone()
            };
        } else if header_text.contains("Status") {
            status = value_text;
        } else if header_text.contains("Type") {
            manga_type = value_text;
        } else if header_text.contains("Bookmarks") {
            bookmarks = value_text;
        } else if header_text.contains("Created") {
            created = value_text;
        } else if header_text.contains("Update") {
            updated = value_text;
        }
    }

    println!("Authors: {}", authors);
    println!("Status: {}", status);
    println!("Type: {}", manga_type);
    println!("Bookmarks: {}", bookmarks);
    println!("Created: {}", created);
    println!("Updated: {}", updated);
    println!("Description: {}", desc);
    println!("Tags: {:#?}", tags);
    println!("separator\n------");

    Ok(())
}
