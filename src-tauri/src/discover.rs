use regex::Regex;
use reqwest::Client;
use scraper::{Html, Selector};
use tauri::App;

use std::{error::Error, fs, path::Path};
use tauri::{command, utils::resources, AppHandle};
use tokio::{fs as tokio_fs, select};
use urlencoding::encode;

//crates
use crate::client::HTTP_CLIENT;
use crate::models::{
    BookInfo, EachChapter, EachChapterSelectors, InfoSelectors, SearchResults, SearchSelectors,
    Source,
};
use crate::sources::get_sources_backend;

//fn

#[command]
pub async fn search_book(query: String, app: AppHandle) -> Result<Vec<SearchResults>, String> {
    let mut res = Vec::new();
    let sources = get_sources_backend(app).map_err(|e| e.to_string())?;

    for source in sources.iter().filter(|s| s.is_selected) {
        let search_url = source.search_pattern.replace("{query}", &encode(&query));

        let response = HTTP_CLIENT
            .get(&search_url)
            .send()
            .await
            .map_err(|e| format!("Failed to get response: {}", e))?;

        let html = response.text().await.map_err(|e| e.to_string())?;
        let doc = Html::parse_document(&html);

        match source.r#type.as_str() {
            // ======================================
            // 🔹 Dynamic sites
            // ======================================
            "dynamic" => {
                let main_sel = Selector::parse(&source.search_selectors.main_div_selectors)
                    .map_err(|e| format!("Invalid main_div_selectors: {}", e))?;

                let title_sel = Selector::parse(&source.search_selectors.title_selector.selector)
                    .map_err(|e| format!("Invalid title selector: {}", e))?;

                let link_sel = Selector::parse(&source.search_selectors.link_selector.selector)
                    .map_err(|e| format!("Invalid link selector: {}", e))?;

                let cover_sel = Selector::parse(
                    &source.search_selectors.cover_image_selector.selector,
                )
                .map_err(|e| format!("Invalid cover selector: {}", e))?;

                for div in doc.select(&main_sel) {
                    // --- Title ---
                    let title = div
                        .select(&title_sel)
                        .next()
                        .and_then(|el| {
                            if let Some(attr_name) =
                                &source.search_selectors.title_selector.attr
                            {
                                el.value().attr(attr_name).map(|v| v.to_string())
                            } else {
                                Some(el.text().collect::<String>().trim().to_string())
                            }
                        })
                        .unwrap_or_default();

                    // --- Link ---
                    let link = div
                        .select(&link_sel)
                        .next()
                        .and_then(|el| {
                            if let Some(attr_name) =
                                &source.search_selectors.link_selector.attr
                            {
                                el.value().attr(attr_name).map(|v| v.to_string())
                            } else {
                                Some(el.text().collect::<String>().trim().to_string())
                            }
                        })
                        .unwrap_or_default();

                    // --- Cover image ---
                    let cover_postpend = div
                        .select(&cover_sel)
                        .next()
                        .and_then(|z| {
                            source
                                .search_selectors
                                .cover_image_selector
                                .attr
                                .as_deref()
                                .and_then(|attr| z.value().attr(attr))
                        })
                        .unwrap_or("")
                        .to_string();
                    let cover_image = format!(
                        "{}{}",
                        &source.url,
                        cover_postpend.trim_start_matches('/')
                    );

                    // --- Latest chapter (optional) ---
                    let latest_chapter = if let Some(ref sel_meta) =
                        source.search_selectors.latest_chapter_selector
                    {
                        let chapter_sel = Selector::parse(&sel_meta.selector)
                            .map_err(|e| format!("Invalid latest chapter selector: {}", e))?;

                        div.select(&chapter_sel)
                            .next()
                            .map(|el| el.text().collect::<String>().trim().to_string())
                    } else {
                        None
                    };

                    // Push result
                    res.push(SearchResults {
                        source_name: source.name.clone(),
                        title,
                        cover_image,
                        link,
                        desc: None,
                        latest_chapter,
                    });
                }
            }

            // ======================================
            // 🔹 Static sites (simpler, one big list)
            // ======================================
            "static" => {
                let title_sel = Selector::parse(&source.search_selectors.title_selector.selector)
                    .map_err(|e| format!("Invalid title selector: {}", e))?;

                let link_sel = Selector::parse(&source.search_selectors.link_selector.selector)
                    .map_err(|e| format!("Invalid link selector: {}", e))?;

                for el in doc.select(&title_sel) {
                    let title = el.text().collect::<String>().trim().to_string();

                    let link = if let Some(attr_name) =
                        &source.search_selectors.link_selector.attr
                    {
                        el.value()
                            .attr(attr_name)
                            .map(|v| v.to_string())
                            .unwrap_or_default()
                    } else {
                        el.text().collect::<String>().trim().to_string()
                    };

                    res.push(SearchResults {
                        source_name: source.name.clone(),
                        title,
                        cover_image: "".to_string(),
                        link,
                        desc: None,
                        latest_chapter: None,
                    });
                }
            }

            // ======================================
            // 🔹 Unknown type
            // ======================================
            _ => {
                eprintln!("Unknown source type: {}", source.r#type);
            }
        }
    }

    Ok(res)
}


#[command]
pub async fn get_book_info(
    link: String,
    source_name: String,
    app: AppHandle,
) -> Result<BookInfo, String> {
    let sources = get_sources_backend(app).map_err(|e| e.to_string())?;

    let source = sources
        .iter()
        .find(|s| s.name == source_name)
        .ok_or_else(|| format!("Source not found: {}", source_name))?;

    let response = HTTP_CLIENT
        .get(&link)
        .send()
        .await
        .map_err(|e| format!("Failed to get response: {}", e))?;

    let html = response.text().await.map_err(|e| e.to_string())?;
    let doc = Html::parse_document(&html);

    let title_selector = Selector::parse(&source.info_selectors.title_selector.selector).unwrap();
    let title = doc
        .select(&title_selector)
        .next()
        .map(|el| el.text().collect::<String>().trim().to_string())
        .unwrap();

    let cover_img_sel =
        Selector::parse(&source.info_selectors.cover_image_selector.selector).unwrap();

    let cover_postpend = doc
        .select(&cover_img_sel)
        .next()
        .and_then(|z| {
            // Only call attr if image_attr is Some
            source
                .info_selectors
                .cover_image_selector
                .attr
                .as_deref()
                .and_then(|attr| z.value().attr(attr))
        })
        .unwrap_or("")
        .to_string();

    let cover_image = format!("{}{}", &source.url, cover_postpend.trim_start_matches('/'));

    let desc_selector = Selector::parse(&source.info_selectors.desc_selector.selector).unwrap();

    let desc = doc
        .select(&desc_selector)
        .next()
        .map(|el| el.text().collect::<String>().trim().to_string())
        .unwrap();

    let author_sel = Selector::parse(&source.info_selectors.author_selector.selector).unwrap();
    let author = doc
        .select(&author_sel)
        .next()
        .map(|z| z.text().collect::<String>().to_string())
        .unwrap_or_default();

    let status = extract_specific_value(
        &doc,
        &source.info_selectors.status_selector.selector,
        "status",
    )
    .unwrap_or_default();

    let r#type =
        extract_specific_value(&doc, &source.info_selectors.type_selector.selector, "type")
            .unwrap_or_default();

    let bookmarks = extract_specific_value(
        &doc,
        &source.info_selectors.bookmarks_selector.selector,
        "bookmarks",
    )
    .unwrap_or_default();

    let created = extract_specific_value(
        &doc,
        &source.info_selectors.created_selector.selector,
        "created",
    )
    .unwrap_or_default();

    let updated = extract_specific_value(
        &doc,
        &source.info_selectors.update_selector.selector,
        "update",
    )
    .unwrap_or_default();

    let chapters_sel = Selector::parse(&source.info_selectors.chapters_selector.selector).unwrap();

    let mut chapters: Vec<EachChapter> = Vec::new();
    for chapter in doc.select(&chapters_sel) {
        let chapter_number = chapter.text().collect::<String>().trim().to_string();

        let chapter_link = if let Some(attr_name) = &source.info_selectors.chapters_selector.attr {
            chapter
                .value()
                .attr(attr_name)
                .map(|v| v.to_string())
                .unwrap_or_default()
        } else {
            // fallback: use the text itself
            chapter.text().collect::<String>().trim().to_string()
        };

        let el_chapter = EachChapter {
            chapter_number: Some(chapter_number),
            chapter_link: Some(chapter_link),
            chapter_name: None,
        };
        chapters.push(el_chapter);

        // println!("{} -> {}", chapter_number, chapter_link);
    }


    let mut tags: Vec<String> = Vec::new();
    let tag_sel =Selector::parse(&source.info_selectors.tags_selector.selector).unwrap();
    for tag in doc.select(&tag_sel){
        let t = tag.text().collect::<String>().trim().to_string();
        tags.push(t);
    }

    let book = BookInfo {
        cover_image,
        title,
        desc: Some(desc),
        chapters,
        status: Some(status),
        bookmarks: Some(bookmarks),
        update: Some(updated),
        created: Some(created),
        author,
        tags,
        r#type: Some(r#type),
    };
    Ok(book)
}

fn extract_specific_value(doc: &Html, selector_str: &str, label: &str) -> Option<String> {
    let sel = Selector::parse(selector_str).ok()?;
    let parent_sel = Selector::parse(".y6x11p").ok()?; // relaxed to match any tag with this class

    for span in doc.select(&sel) {
        let span_text = span.text().collect::<String>().trim().to_string();

        // --- Case 1: Label is inside the span itself ---
        if span_text.to_lowercase().contains(&label.to_lowercase()) {
            // Remove label text like "type :" or "status :"
            let cleaned = span_text
                .replace(&format!("{} :", label), "")
                .replace(&format!("{}:", label), "")
                .replace(&label.to_lowercase(), "")
                .trim()
                .to_string();
            return Some(cleaned);
        }

        // --- Case 2: Label is in parent text ---
        if let Some(parent) = span.ancestors().find_map(|node| {
            node.value().as_element().and_then(|el| {
                let class = el.attr("class").unwrap_or("");
                if class.contains("y6x11p") {
                    Some(node)
                } else {
                    None
                }
            })
        }) {
            let parent_el = scraper::ElementRef::wrap(parent)?;
            let parent_text = parent_el.text().collect::<String>().to_lowercase();

            if parent_text.contains(&label.to_lowercase()) {
                return Some(span_text);
            }
        }
    }

    None
}
