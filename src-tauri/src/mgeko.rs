///
use futures::stream::Scan;
use futures::{stream, StreamExt};
use rayon::prelude::*;
use scraper::{Html, Selector};
use std::ops::{Deref, DerefMut};
use std::sync::Arc;
///
use std::time::Instant;
use tauri::{http::status, AppHandle};
use uuid::Uuid;

use crate::book::{ChapterStruct, PageStruct};
use crate::{
    book::{AttrItemStruct, AttributeStruct, Series},
    client::HTTP_CLIENT,
    helper::{clean_description, get_val, map_series_sites_to_enum, pls_stringify},
    scraper::{Scraper, ScraperConf, ScraperSel},
};

#[derive(Clone)]
pub struct Mgeko {
    pub scraper: Scraper, // composition
    pub extra_field: String,
    // Mgeko-specific data (optional)
}

// Give it all powers of Scraper automatically
impl Deref for Mgeko {
    type Target = Scraper;
    fn deref(&self) -> &Self::Target {
        &self.scraper
    }
}

impl DerefMut for Mgeko {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.scraper
    }
}

// Now add Mgeko-specific methods
impl Mgeko {
    pub fn load_all(app: &AppHandle) -> Result<Self, String> {
        let sel = Scraper::get_sel(app, "mgeko")?;
        let conf = Scraper::get_conf(app, "mgeko")?;
        Ok(Self {
            scraper: Scraper { sel, conf },
            extra_field: String::from("Mgeko-specific data"),
        })
    }

    pub async fn search_mgeko(&self, query: String) -> Result<Vec<Series>, String> {
        let start = Instant::now();

        // 1️⃣ Get all search links
        let links = self.send_search(query).await?;
        // println!("Got {} links", links.len());

        // 2️⃣ Fetch HTML concurrently
        let htmls: Vec<_> = stream::iter(links.into_iter())
            .map(|url| async move {
                match HTTP_CLIENT.get(&url).send().await {
                    Ok(resp) if resp.status().is_success() => match resp.text().await {
                        Ok(text) => Ok((url, text)),
                        Err(e) => Err(format!("Failed to read body: {}", e)),
                    },
                    Ok(resp) => Err(format!("Bad status {} for {}", resp.status(), url)),
                    Err(e) => Err(format!("Request failed for {}: {}", url, e)),
                }
            })
            .buffer_unordered(20)
            .filter_map(|res| async move { res.ok() })
            .collect()
            .await;

        // println!(
        //     "Fetched {} HTML pages in {:.2?}",
        //     htmls.len(),
        //     start.elapsed()
        // );

        // 3️⃣ Parse all HTML in parallel
        let sel = Arc::new(self.sel.clone());
        let conf = Arc::new(self.conf.clone());

        let parsed: Vec<(Series, String)> = htmls
            .into_par_iter()
            .filter_map(|(_, html)| Mgeko::parse_each_link_metadata(&sel, &conf, html).ok())
            .collect();

        // println!("Parsed {} series", parsed.len());

        // 4️⃣ Fetch chapter counts concurrently (async)
        let results = stream::iter(parsed.into_iter())
            .map(|(mut series, chapters_link)| async move {
                match self.send_chapter_count(chapters_link).await {
                    Ok(count) => series.chapter_count = count,
                    Err(e) => eprintln!("Chapter count failed: {}", e),
                }
                series
            })
            .buffer_unordered(10)
            .collect::<Vec<_>>()
            .await;

        // println!(
        //     "Total finished in {:.2?} with {} series",
        //     start.elapsed(),
        //     results.len()
        // );

        Ok(results)
    }

    pub fn parse_each_link_metadata(
        sel: &ScraperSel,
        conf: &ScraperConf,
        html: String,
    ) -> Result<(Series, String), String> {
        let doc = Html::parse_document(&html);
        let title = Scraper::extract_text(&doc, &sel.title).unwrap_or_else(|_| "not-found".into());
        let alt_title =
            Scraper::extract_text(&doc, &sel.alt_title).unwrap_or_else(|_| "not-found".into());
        let cover_img_raw =
            Scraper::extract_attr(&doc, &sel.cover_img).unwrap_or_else(|_| "not-found".into());

        let desc = clean_description(
            &Scraper::extract_text(&doc, &sel.desc).unwrap_or("not-found".into()),
            None,
        );
        // println!("desc: {:#?},  desc_str: {}", &sel.desc, desc);
        let attrs = Mgeko::send_attr(&sel, &doc).unwrap_or_default();
        let all_chapter_link = Scraper::format_full_url(
            &conf,
            Scraper::extract_attr(&doc, &sel.chapters_link).unwrap_or(pls_stringify("")),
        );
        let series = Series {
            id: Uuid::new_v4().to_string(),
            site: crate::book::SitesEnum::Mgeko,
            title,
            alt_title,
            cover_img_url: cover_img_raw,
            desc,
            favorite: false,
            attributes: attrs,
            all_chapters_url: all_chapter_link.clone(),
            ..Default::default()
        };
        Ok((series, all_chapter_link))
    }
    pub fn send_status(sel: &ScraperSel, doc: &scraper::Html) -> Result<String, String> {
        let sel_ = Selector::parse(&sel.latest_chapter.sel)
            .map_err(|e| format!("failed to parse latest_chapter selector: {}", e))?;
        let strong_sel = Selector::parse("strong")
            .map_err(|e| format!("failed to parse <strong> selector: {}", e))?;
        let small_sel = Selector::parse("small")
            .map_err(|e| format!("failed to parse <small> selector: {}", e))?;

        // Find the first element where <small> is "status"
        let status = doc
            .select(&sel_)
            .find_map(|x| {
                let label = x
                    .select(&small_sel)
                    .next()
                    .map(|el| get_val(&el, None))
                    .unwrap_or_else(|| pls_stringify("not-found"));

                if label.to_lowercase() == "status" {
                    Some(
                        x.select(&strong_sel)
                            .next()
                            .map(|el| get_val(&el, None))
                            .unwrap_or_else(|| pls_stringify("not-found")),
                    )
                } else {
                    None
                }
            })
            .unwrap_or_else(|| pls_stringify("not-found"));

        Ok(status)
    }

    pub fn send_attr(sel: &ScraperSel, doc: &scraper::Html) -> Result<AttributeStruct, String> {
        let status = map_series_sites_to_enum(Self::send_status(&sel, &doc).unwrap_or_default());
        let tags: Vec<AttrItemStruct> = Scraper::extract_list(&doc, &sel.tags)
            .into_iter()
            .map(|el| AttrItemStruct {
                name: el,
                url: pls_stringify(""),
                path: pls_stringify(""),
            })
            .collect();
        let category: AttrItemStruct = Scraper::extract_list(&doc, &sel.tags)
            .into_iter()
            .find(|tag| {
                matches!(
                    tag.to_lowercase().as_str(),
                    "manhua" | "manhwa" | "novel" | "manga"
                )
            })
            .map(|tag| AttrItemStruct {
                name: tag,
                url: pls_stringify(""),
                path: pls_stringify(""),
            })
            .unwrap_or(AttrItemStruct {
                name: "not-found".to_string(),
                url: pls_stringify(""),
                path: pls_stringify(""),
            });
        let authors = AttrItemStruct {
            name: Scraper::extract_text(&doc, &sel.authors).unwrap_or(pls_stringify("not-found")),
            url: pls_stringify(""),
            path: pls_stringify(""),
        };
        let attributes = AttributeStruct {
            status: status,
            authors: authors,
            tags: tags,
            category: category,
        };
        Ok(attributes)
    }
    async fn send_chapter_count(&self, url: String) -> Result<usize, String> {
        let link = Scraper::format_full_url(&self.conf, url);
        let new_doc = Scraper::send_html_doc(link)
            .await
            .map_err(|el| format!("failed : {}", el))?;
        let int_sel = Selector::parse(&self.sel.each_chapter_list_link.sel)
            .map_err(|e| format!("Invalid main_selectors: {}", e))?;
        let int = new_doc.select(&int_sel).count();
        drop(new_doc);
        Ok(int)
    }
    pub async fn get_book(&self, series: Series) -> Result<Series, String> {
        

        let chapters_meta: Vec<(String, String)> = self
            .send_each_chapter_link_0_title(series.all_chapters_url.clone())
            .await
            .unwrap_or_default();

       
        let chapters: Vec<ChapterStruct> = chapters_meta
            .into_par_iter() 
            .enumerate()
            .filter_map(|(i, (url, title))| {
               
                Some(ChapterStruct {
                    order: (i+1) as u64,
                    title: title,
                    url,
                    ..Default::default()
                })
            })
            .collect();

        let mut updated_series = series.clone();
        updated_series.chapters = chapters;

        Ok(updated_series)
    }
   pub async fn get_chapter(&self,series: Series, url: String) -> Result<Series, String> {
    // Step 1: Fetch HTML from the given chapter URL
    let html = Scraper::send_html_string(url.clone()).await?;

    // Step 2: Extract image URLs (assuming this returns Vec<String>)
    let vec_pages = Mgeko::send_chapter_images(&self.sel, &self.conf, html)
        .map_err(|e| format!("Failed to extract images: {}", e))?;

    // Step 3: Convert image URLs into PageStructs
    let pages: Vec<PageStruct> = vec_pages
        .into_iter()
        .enumerate()
        .map(|(j, el)| PageStruct {
            order: (j+1) as u64,
            url: el,
            ..Default::default()
        })
        .collect();
        let mut new_series = series.clone();
    if let Some(chapter) = new_series.chapters.iter_mut().find(|c| c.url == url) {
        chapter.pages = pages;
        Ok(new_series)
    } else {
        Err(format!("Chapter with URL '{}' not found in series", url))
    }
}
    pub fn send_chapter_images(
        sel: &ScraperSel,
        conf: &ScraperConf,
        html: String,
    ) -> Result<Vec<String>, String> {
        let doc = Html::parse_document(&html);
        // println!("doc:: {:#?}",doc);
        let selector = Selector::parse(&sel.chapter_pages.sel)
            .map_err(|e| format!("Failed to parse send_chapter_images: {}", e))?;
        // println!("sel: {:#?}",selector);
        let mut res = Vec::new();
        for img in doc.select(&selector) {
            let i = img
                .value()
                .attr(&sel.chapter_pages.attr)
                .unwrap_or("not-found")
                .to_string();
            // println!("i: {}", i);
            res.push(i);
        }
        // println!("res: {:#?}",res);
        Ok(res)
    }
}
