use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use urlencoding::encode;
// use uuid::Uuid;

use crate::book::{
    // AttrItemStruct, AttributeStruct, Series, 
    SitesEnum};
use crate::client::HTTP_CLIENT;
use crate::helper::{
    format_join, get_app_source_dir, get_val,
    //  map_series_sites_to_enum, pls_stringify,
};
// use crate::wrap_err;


///
const MGEKO_SEL: &str = include_str!("../assets/sources/mgeko/sel.json");
///
const MGEKO_CONF: &str = include_str!("../assets/sources/mgeko/config.json");
///
// const HENTAI20_SEL: &str = include_str!("../assets/sources/hentai20/sel.json");



/// sel css, attr for html
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SelItem {
    pub sel: String,
    pub attr: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ChapterListLink {
    pub sel: String,
    pub attr: String,
    pub chapter_title: SelItem,
    pub time: SelItem,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ScraperSel {
    pub series_link: SelItem,
    pub cover_img: SelItem,
    pub title: SelItem,
    pub alt_title: SelItem,
    pub authors: SelItem,
    pub latest_chapter: SelItem,
    pub tags: SelItem,
    pub chapters_link: SelItem,
    pub desc: SelItem,
    pub each_chapter_list_link: ChapterListLink,
    pub chapter_pages: SelItem,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ScraperConf {
    pub name: SitesEnum,
    pub url: String,
    pub search_url: String,
    pub is_selected: bool,
    pub is_nsfw: bool,
    pub is_main: bool,
    pub is_fav: bool,
    pub is_all: bool,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Scraper {
    pub sel: ScraperSel,
    pub conf: ScraperConf,
}

impl Scraper {
    /// 🔍 Resolve a JSON asset path for both dev and bundled modes.
    pub fn resolve_asset_path(app: &AppHandle, site: &str, filename: &str) -> PathBuf {
        // Try bundled resource path first (used in packaged builds)
        if let Ok(mut path) = app.path().resource_dir() {
            path.push("assets/sources");
            path.push(site);
            path.push(filename);
            if path.exists() {
                return path;
            }
        }

        // Fallback to development path (when running `cargo tauri dev`)
        let dev_path = PathBuf::from("src-tauri/assets/sources")
            .join(site)
            .join(filename);
        dev_path
    }

   
/// 🔹 Loads embedded sel.json and writes it to the app source dir
pub fn get_sel(app: &AppHandle, site: &str) -> Result<ScraperSel, String> {
    // pick embedded content
    let data = match site {
        "mgeko" => MGEKO_SEL,
        _ => return Err(format!("No embedded sel.json for site '{}'", site)),
    };

    // parse to ensure it’s valid JSON
    let sel: ScraperSel =
        serde_json::from_str(data).map_err(|e| format!("Failed to parse sel.json: {}", e))?;

    // ensure the output dir exists
    let sel_path = get_app_source_dir(app.clone())?
        .join(site)
        .join("sel.json");
    if let Some(parent) = sel_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create dir for sel.json: {}", e))?;
    }

    // write formatted JSON back to disk
    let pretty = serde_json::to_string_pretty(&sel)
        .map_err(|e| format!("Failed to serialize sel.json: {}", e))?;
    fs::write(&sel_path, pretty)
        .map_err(|e| format!("Failed to write sel.json: {}", e))?;

    Ok(sel)
}

/// 🔹 Loads embedded config.json and writes it to the app source dir
pub fn get_conf(app: &AppHandle, site: &str) -> Result<ScraperConf, String> {
    let data = match site {
        "mgeko" => MGEKO_CONF,
        _ => return Err(format!("No embedded config.json for site '{}'", site)),
    };

    // parse embedded config
    let conf: ScraperConf =
        serde_json::from_str(data).map_err(|e| format!("Failed to parse config.json: {}", e))?;

    // ensure the output dir exists
    let conf_path = get_app_source_dir(app.clone())?
        .join(site)
        .join("config.json");
    if let Some(parent) = conf_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create dir for config.json: {}", e))?;
    }

    // write formatted JSON back to disk
    let pretty = serde_json::to_string_pretty(&conf)
        .map_err(|e| format!("Failed to serialize config.json: {}", e))?;
    fs::write(&conf_path, pretty)
        .map_err(|e| format!("Failed to write config.json: {}", e))?;

    Ok(conf)
}

    /// Combines both get_conf and get_sel
    pub fn get_all(app: &AppHandle, site: &str) -> Result<Scraper, String> {
        let conf = Self::get_conf(app, site)?;
        let sel = Self::get_sel(app, site)?;
        Ok(Scraper { sel, conf })
    }

    pub fn format_full_url(conf: &ScraperConf, input: String) -> String {
        format_join(&conf.url, &input)
    }

    /// Fetches search results and returns series links only
    pub async fn send_search(&self, query: String) -> Result<Vec<String>, String> {
        let mut res = Vec::new();

        let s_url = self.conf.search_url.replace("{query}", &encode(&query));
        // println!("🔍 Searching: {}", s_url);

        let response = HTTP_CLIENT
            .get(&s_url)
            .send()
            .await
            .map_err(|e| format!("Failed to get response: {}", e))?;

        let html = response.text().await.map_err(|e| e.to_string())?;
        let doc = Html::parse_document(&html);
        // println!("🔍 Search HTML fetched.: {}", html);

         // Parse series link selector
        let series_link_sel = Selector::parse(&self.sel.series_link.sel)
            .map_err(|e| format!("Invalid series_link_sel: {}", e))?;

        for el in doc.select(&series_link_sel) {
            if let Some(link) = el.value().attr(&self.sel.series_link.attr) {
                let full_link = Scraper::format_full_url(&&self.conf, link.to_string());
                res.push(full_link);
            }
            // println!("Found link: {:?}", res.last());
        }

        Ok(res)
    }
    /// returns -> (link,title)
   pub async fn send_each_chapter_link_0_title(
    &self,
    url: String,
) -> Result<Vec<(String, String)>, String> {
    // Fetch HTML
    let response = HTTP_CLIENT
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to get response: {}", e))?;

    let html = response.text().await.map_err(|e| e.to_string())?;
    let doc = Html::parse_document(&html);

    // Parse selectors
    let chapter_list_sel = Selector::parse(&self.sel.each_chapter_list_link.sel)
        .map_err(|e| format!("Invalid chapter list selector: {}", e))?;
    let chapter_title_sel = Selector::parse(&self.sel.each_chapter_list_link.chapter_title.sel)
        .map_err(|e| format!("Invalid chapter title selector: {}", e))?;

    // ✅ Initialize the result vector
    let mut results: Vec<(String, String)> = Vec::new();

    // Extract chapters
    for el in doc.select(&chapter_list_sel) {
        // Extract raw link
        let raw_link = el
            .value()
            .attr(&self.sel.each_chapter_list_link.attr)
            .unwrap_or("not-found")
            .to_string();

        // Format full URL if relative
        let link = if raw_link.starts_with("https://") {
            raw_link.to_string()
        } else {
            Scraper::format_full_url(&self.conf, raw_link)
        };
        // println!("link: from send_enc....: {}",link);
        // Extract title
        let title = el
            .select(&chapter_title_sel)
            .next()
            .map(|t| get_val(&t, None))
            .unwrap_or_else(|| "not-found".to_string());

        results.push((link, title));
    }

    Ok(results)
}
    pub async fn send_html_doc(url: String) -> Result<scraper::Html, String> {
        // println!("html_doc url : {}",url);
        let response = HTTP_CLIENT
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Failed to get response: {}", e))?;

        let html = response.text().await.map_err(|e| e.to_string())?;
        let doc = Html::parse_document(&html);
        Ok(doc)
    }
    pub async fn send_html_string(url: String) -> Result<String, String> {
        // println!("html_string url : {}",url);
        let response = HTTP_CLIENT
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Failed to get response: {}", e))?;

        let html = response.text().await.map_err(|e| e.to_string())?;

        Ok(html)
    }
    /// Extracts the text content of the first element matching the selector.
    pub fn extract_text(doc: &Html, sel: &SelItem) -> Result<String, String> {
        // Try to parse the CSS selector
        let selector =
            Selector::parse(&sel.sel).map_err(|_| format!("Invalid selector: {}", sel.sel))?;

        // Find the first matching element
        let element = doc.select(&selector).next();

        // Collect all text nodes and trim whitespace
        let text = element
            .map(|el| el.text().collect::<String>().trim().to_string())
            .unwrap_or_default();

        Ok(text)
    }

    /// Extracts an attribute value (like `src`, `href`, etc.) from the first matching element.
    pub fn extract_attr(doc: &Html, sel: &SelItem) -> Result<String, String> {
        // Parse CSS selector safely
        let selector =
            Selector::parse(&sel.sel).map_err(|_| format!("Invalid selector: {}", sel.sel))?;

        // Find first element and its attribute
        let attr_val = doc
            .select(&selector)
            .next()
            .and_then(|el| el.value().attr(&sel.attr))
            .unwrap_or("")
            .trim()
            .to_string();

        Ok(attr_val)
    }
    /// Extracts all text values from a selector (e.g. list of tags or authors)
    pub fn extract_list(doc: &Html, sel: &SelItem) -> Vec<String> {
        if let Ok(selector) = Selector::parse(&sel.sel) {
            doc.select(&selector)
                .map(|e| e.text().collect::<String>().trim().to_string())
                .filter(|s| !s.is_empty())
                .collect()
        } else {
            vec![]
        }
    }
}
