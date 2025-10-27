use std::ops::{Deref, DerefMut};

use futures::stream::Scan;
use scraper::{Html, Selector};
use tauri::{http::status, AppHandle};
use uuid::Uuid;

use crate::{
    book::{AttrItemStruct, AttributeStruct, Series},
    helper::{get_val, map_series_sites_to_enum, pls_stringify, clean_description},
    scraper::{Scraper, ScraperConf, ScraperSel, SelItem},
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
    let mut vec_series = Vec::new();
    let links = self.send_search(query.clone()).await?;

    for el in links {
        let html = Scraper::send_html_string(el.clone()).await?;
        let sel = self.sel.clone();
        let conf =self.conf.clone();
        let (mut series, all_chapter_link) = tokio::task::spawn_blocking(move || {
            Mgeko::parse_each_link_metadata(&sel, &conf, html)
        }).await.map_err(|e| format!("Join error parsing main page: {}", e))??;
        

        // Async call can use doc safely
        let chapter_count = self.send_chapter_count(all_chapter_link).await?;
         series.chapter_count = chapter_count;
         vec_series.push(series);
        
    }

    Ok(vec_series)
}

pub fn parse_each_link_metadata(sel : &ScraperSel, _conf: &ScraperConf ,html:String)->Result<(Series,String),String>{
    let doc = Html::parse_document(&html);
    let title = Scraper::extract_text(&doc, &sel.title)
            .unwrap_or_else(|_| "not-found".into());
        let alt_title = Scraper::extract_text(&doc, &sel.alt_title)
            .unwrap_or_else(|_| "not-found".into());
        let cover_img_raw = Scraper::extract_attr(&doc, &sel.cover_img)
            .unwrap_or_else(|_| "not-found".into());
        
        let desc = clean_description(&Scraper::extract_text(&doc, &sel.desc)
            .unwrap_or( "not-found".into()), None);
        println!("desc: {:#?},  desc_str: {}", &sel.desc, desc);
        let attrs = Mgeko::send_attr(&sel,&doc).unwrap_or_default();
    let all_chapter_link =
            Scraper::extract_attr(&doc, &sel.chapters_link).unwrap_or(pls_stringify(""));
        let series = Series {
            id: Uuid::new_v4().to_string(),
            site: crate::book::SitesEnum::Mgeko,
            title,
            alt_title,
            cover_img_url: cover_img_raw,
            desc,
            favorite: false,
            attributes: attrs,
            ..Default::default()

        };
        Ok((series,all_chapter_link))
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

    pub fn send_attr(sel : &ScraperSel, doc: &scraper::Html) -> Result<AttributeStruct, String> {
        let status = map_series_sites_to_enum(Self::send_status(&sel,&doc).unwrap_or_default());
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
            name: Scraper::extract_text(&doc, &sel.authors)
                .unwrap_or(pls_stringify("not-found")),
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
    pub async fn get_book(&self, url: String) -> Result<Series, String> {
        // Mgeko-specific parsing logic
        println!("Fetching Mgeko series: {}", url);
        todo!()
    }
}
