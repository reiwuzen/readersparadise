use reqwest::blocking::get;
use serde::{Deserialize, Serialize};
// use serde_json::Result as JsonResult;
use scraper::{Html, Selector};
use std::fmt::format;
use std::fs;
use std::path::Path;
use tauri::http::status;
use tauri::{AppHandle, Manager};
use urlencoding::encode;

///crate
use crate::client::HTTP_CLIENT;
use crate::helper::{as_opt_str, clean_description, format_join, get_direct_text, get_val};
use crate::models::{BookInfo, EachChapter, SearchResults};
use crate::wrap_err;

//traits
use crate::sources::F;
//structs
use crate::sources::{BookSel, Conf, SearchSel, Sel};

impl F for Mgeko {
    fn is_selected(&self) -> bool {
        self.config.is_selected
    }
    fn is_nsfw(&self) -> bool {
        self.config.is_nsfw
    }
    fn is_main(&self) -> bool {
        self.config.is_main
    }
    fn is_fav(&self) -> bool {
        self.config.is_fav
    }
    fn is_all(&self) -> bool {
        self.config.is_all
    }
}
// --- Main Mgeko struct ---
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Mgeko {
    pub config: Conf,
    pub selectors: Sel,
}

impl Mgeko {
    pub fn load_all(app: &AppHandle) -> Result<Mgeko, String> {
        Ok(Mgeko {
            config: Mgeko::load_config(app)?,
            selectors: Mgeko::load_selectors(app)?,
        })
    }
    pub fn load_and_write_all(app: &AppHandle) -> Result<Mgeko, String> {
        let config = wrap_err!(
            Mgeko::load_and_write_config(app),
            "Failed to load and write config"
        )?;

        let selectors = wrap_err!(
            Mgeko::load_and_write_selectors(app),
            "Failed to load and write selectors"
        )?;

        Ok(Mgeko { config, selectors })
    }

    /// Load selectors JSON from app_data_dir, fallback to assets if missing
    pub fn load_config(app: &AppHandle) -> Result<Conf, String> {
        // Get app data directory
        let app_dir = wrap_err!(app.path().app_data_dir(), "Failed to get app data dir")?;
        let source_dir = app_dir.join("source");
        let mgeko_dir = source_dir.join("mgkeo");
        wrap_err!(
            fs::create_dir_all(&mgeko_dir),
            "Failed to create source directory"
        )?;

        let conf_path = mgeko_dir.join("config.json");

        if conf_path.is_file() {
            // Read config from app data dir
            let data = wrap_err!(
                fs::read_to_string(&conf_path),
                "Failed to read config.json from app data dir"
            )?;
            let config: Conf =
                wrap_err!(serde_json::from_str(&data), "Failed to parse config.json")?;
            Ok(config)
        } else {
            // Fallback: load from assets and write to app data dir
            Mgeko::load_and_write_config(app)
        }
    }
    pub fn load_selectors(app: &AppHandle) -> Result<Sel, String> {
        // Get app data directory
        let app_dir = wrap_err!(app.path().app_data_dir(), "Failed to get app data dir")?;
        let source_dir = app_dir.join("source");
        let mgeko_dir = source_dir.join("mgkeo");
        wrap_err!(
            fs::create_dir_all(&mgeko_dir),
            "Failed to create source directory"
        )?;

        let sel_path = mgeko_dir.join("selectors.json");

        if sel_path.is_file() {
            // Read selectors from app data dir
            let data = wrap_err!(
                fs::read_to_string(&sel_path),
                "Failed to read selectors.json from app data dir"
            )?;
            let selectors: Sel = wrap_err!(
                serde_json::from_str(&data),
                "Failed to parse selectors.json"
            )?;
            Ok(selectors)
        } else {
            // Load from assets and write to app data dir
            Mgeko::load_and_write_selectors(app)
        }
    }

    pub fn load_and_write_config(app: &AppHandle) -> Result<Conf, String> {
        // let asset_path = Path::new("./src-tauri/assets/sources/mgeko/config.json");

        // // Read from assets
        // let data = wrap_err!(
        //     fs::read_to_string(&asset_path),
        //     "Failed to read config.json from assets"
        // )?;

        let data = include_str!("../assets/sources/mgeko/config.json");

        // Parse JSON
        let config: Conf = wrap_err!(
            serde_json::from_str(&data),
            "Failed to parse config.json from assets"
        )?;

        // Get app data dir
        let app_dir = wrap_err!(app.path().app_data_dir(), "Failed to get app data dir")?;
        let source_dir = app_dir.join("source");
        let mgeko_dir = source_dir.join("mgkeo");
        wrap_err!(
            fs::create_dir_all(&mgeko_dir),
            "Failed to create source directory"
        )?;

        // Write to app data dir
        let conf_path = mgeko_dir.join("config.json");
        let data = wrap_err!(
            serde_json::to_string_pretty(&config),
            "Failed to serialize config"
        )?;
        wrap_err!(fs::write(&conf_path, data), "Failed to write config.json")?;

        Ok(config)
    }

    /// Load selectors from assets and write to app data dir
    pub fn load_and_write_selectors(app: &AppHandle) -> Result<Sel, String> {
        // let asset_path = Path::new("./src-tauri/assets/sources/mgeko/selectors.json");
        // let data = wrap_err!(
        //     fs::read_to_string(&asset_path),
        //     "Failed to read selectors.json from assets"
        // )?;

        let data = include_str!("../assets/sources/mgeko/selectors.json");
        let selectors: Sel = wrap_err!(
            serde_json::from_str(&data),
            "Failed to parse selectors.json from assets"
        )?;

        let app_dir = wrap_err!(app.path().app_data_dir(), "Failed to get app data dir")?;
        let source_dir = app_dir.join("source");
        let mgeko_dir = source_dir.join("mgkeo");
        wrap_err!(
            fs::create_dir_all(&mgeko_dir),
            "Failed to create source directory"
        )?;

        let sel_path = mgeko_dir.join("selectors.json");
        let data = wrap_err!(
            serde_json::to_string_pretty(&selectors),
            "Failed to serialize selectors"
        )?;
        wrap_err!(fs::write(&sel_path, data), "Failed to write selectors.json")?;

        Ok(selectors)
    }

    /// Return search selectors
    pub fn get_search_selector(&self) -> &SearchSel {
        &self.selectors.search_sel
    }

    /// Return book selectors
    pub fn get_book_selector(&self) -> &BookSel {
        &self.selectors.book_sel
    }

    /// Stub search function
    pub async fn search(&self, query: String) -> Result<Vec<SearchResults>, String> {
        let mut res = Vec::new();
        let s_url = self
            .selectors
            .search_url
            .replace("{query}", &encode(&query));
        let response = HTTP_CLIENT
            .get(&s_url)
            .send()
            .await
            .map_err(|e| format!("Failed to get response: {}", e))?;

        let html = response.text().await.map_err(|e| e.to_string())?;
        let doc = Html::parse_document(&html);

        {
            let main_sel = Selector::parse(&self.selectors.search_sel.main_sel)
                .map_err(|e| format!("Invalid main_selectors: {}", e))?;
            //
            let title_sel = Selector::parse(&self.selectors.search_sel.title_sel.sel)
                .map_err(|e| format!("Invalid title_selector: {}", e))?;
            //
            let link_sel = Selector::parse(&self.selectors.search_sel.link_sel.sel)
                .map_err(|e| format!("Invalid link_selector: {}", e))?;
            //
            let cover_sel = Selector::parse(&self.selectors.search_sel.cover_img_sel.sel)
                .map_err(|e| format!("Invalid cover selector: {}", e))?;
            let latest_chapter_sel =
                Selector::parse(&self.selectors.search_sel.stats_sel.latest_chapter_sel.sel)
                    .map_err(|e| format!("Invalid latest_chapter selector: {}", e))?;

            for el in doc.select(&main_sel) {
                let title = el
                    .select(&title_sel)
                    .next()
                    .map(|el| get_val(&el, None))
                    .unwrap_or_default();

                //
                let link_post = el
                    .select(&link_sel)
                    .next()
                    .map(|el| get_val(&el, as_opt_str(&self.selectors.search_sel.link_sel.attr)))
                    .unwrap_or_default();
                //
                let link = format_join(&self.selectors.url, &link_post);
                //
                let cover_img_post = el
                    .select(&cover_sel)
                    .next()
                    .map(|el| {
                        get_val(
                            &el,
                            as_opt_str(&self.selectors.search_sel.cover_img_sel.attr),
                        )
                    })
                    .unwrap_or_default();
                //
                let cover_img = format_join(&self.selectors.url, &cover_img_post);
                //
                let latest_chapter = el
                    .select(&latest_chapter_sel)
                    .next()
                    .map(|el| get_val(&el, None));

                res.push(SearchResults {
                    source_name: self.selectors.name.clone(),
                    title: title,
                    link: link,
                    cover_image: cover_img,
                    latest_chapter: latest_chapter,
                    desc: None,
                });
            }
        }
        Ok(res)
    }
    pub async fn get_book(&self, link: String) -> Result<BookInfo, String> {
        // --- 1️⃣ Fetch the main book page (async safe) ---
        let response = HTTP_CLIENT
            .get(&link)
            .send()
            .await
            .map_err(|e| format!("Failed to get response: {}", e))?;

        let html = response.text().await.map_err(|e| e.to_string())?;

        // Clone your selectors & config because `&self` can't move into another thread.
        let selectors = self.selectors.clone();
        let config = self.config.clone();

        // --- 2️⃣ Parse book info and find all_ch_link in a blocking thread ---
        let (mut book, all_ch_link) = tokio::task::spawn_blocking(move || {
            Mgeko::parse_book_metadata_and_all_ch_link(&selectors, &config, html)
        })
        .await
        .map_err(|e| format!("Join error parsing main page: {}", e))??;

        // --- 3️⃣ Fetch the chapters page (async safe) ---
        let new_resp = HTTP_CLIENT
            .get(&all_ch_link)
            .send()
            .await
            .map_err(|e| format!("Failed to get response: {}", e))?;
        let new_html = new_resp.text().await.map_err(|e| e.to_string())?;

        // --- 4️⃣ Parse chapters on blocking thread ---
        let selectors_for_chapters = self.selectors.clone(); // clone again for thread safety
        let chapters = tokio::task::spawn_blocking(move || {
            Mgeko::parse_chapters_from_html(&selectors_for_chapters, new_html)
        })
        .await
        .map_err(|e| format!("Join error parsing chapters: {}", e))??;

        // --- 5️⃣ Combine results ---
        book.chapters = chapters;
        Ok(book)
    }
    pub async fn get_chapter(&self, link: String) -> Result<Vec<String>, String> {
        let resp = HTTP_CLIENT
            .get(&link)
            .send()
            .await
            .map_err(|e| format!("Failed to get response: {}", e))?;
        let html = resp.text().await.map_err(|e| e.to_string())?;
        let doc = Html::parse_document(&html);

        let e_img_sel = wrap_err!(
            Selector::parse("div#chapter-reader img"),
            "failed to parse e_img_sel"
        )?;
        let mut img_s = Vec::new();
        for e_img in doc.select(&e_img_sel) {
            // Try src first, then data-src, then data-original
            let src = e_img
                .value()
                .attr("src")
                .or_else(|| e_img.value().attr("data-src"))
                .or_else(|| e_img.value().attr("data-original"))
                .unwrap_or_default()
                .to_string();
            if !src.is_empty() {
                img_s.push(src);
            }
        }
        if img_s.last().map(|s| s.as_str()) == Some("https://imgsrv4.com/credits-mgeko.png") {
            img_s.pop();
        }
        Ok(img_s)
    }
    pub fn parse_book_metadata_and_all_ch_link(
        selectors: &Sel, // <- same struct as self.selectors
        config: &Conf,   // <- same struct as self.config
        html: String,
    ) -> Result<(BookInfo, String), String> {
        let doc = Html::parse_document(&html);

        let title_sel = Selector::parse(&selectors.book_sel.title_sel.sel)
            .map_err(|e| format!("Failed to parse title_sel: {}", e))?;
        let cover_img_sel = Selector::parse(&selectors.book_sel.cover_img_sel.sel)
            .map_err(|e| format!("Failed to parse cover_img_sel: {}", e))?;
        let desc_sel = Selector::parse(&selectors.book_sel.desc.sel)
            .map_err(|e| format!("Failed to parse desc_sel: {}", e))?;
        let stats_sel = Selector::parse(&selectors.book_sel.stats.sel)
            .map_err(|e| format!("Failed to parse stats_sel: {}", e))?;

        let title = doc
            .select(&title_sel)
            .next()
            .map(|el| get_val(&el, None))
            .unwrap_or_default();

        let cover_image = doc
            .select(&cover_img_sel)
            .next()
            .map(|el| get_val(&el, as_opt_str(&selectors.book_sel.cover_img_sel.attr)))
            .unwrap_or_default();

        let raw_desc = doc
            .select(&desc_sel)
            .next()
            .map(|el| get_val(&el, None))
            .unwrap_or_default();
        let desc = Some(clean_description(&raw_desc, None));

        // genres
        let mut tags = Vec::new();
        let genre_sel = Selector::parse(&selectors.book_sel.categories.sel)
            .map_err(|e| format!("Failed to parse genre_sel: {}", e))?;
        for g in doc.select(&genre_sel) {
            tags.push(g.text().collect::<String>());
        }

        // author
        let author_sel = Selector::parse(&selectors.book_sel.author_sel.sel)
            .map_err(|e| format!("Failed to parse author_sel: {}", e))?;
        let author = doc
            .select(&author_sel)
            .next()
            .map(|el| get_val(&el, None))
            .unwrap_or_default();

        // stats
        let mut bookmarks = String::new();
        let mut status = String::new();
        let mut views = String::new();
        let strong_sel = Selector::parse("strong").unwrap();
        let small_sel = Selector::parse("small").unwrap();

        for stat in doc.select(&stats_sel) {
            let strong = stat
                .select(&strong_sel)
                .next()
                .map(|el| get_val(&el, None))
                .unwrap_or_default();
            let small = stat
                .select(&small_sel)
                .next()
                .map(|el| get_val(&el, None))
                .unwrap_or_default();
            match small.as_str() {
                "Views" => views = strong,
                "Bookmarked" => bookmarks = strong,
                "Status" => status = strong,
                _ => {}
            }
        }

        // update
        let update_sel = Selector::parse(&selectors.book_sel.update_info.sel)
            .map_err(|e| format!("Failed to parse update_sel: {}", e))?;
        let update = doc.select(&update_sel).next().map(|el| get_val(&el, None));

        // all chapters link
        let all_chapters_link_sel = Selector::parse("div.intro a#library-push")
            .map_err(|e| format!("Failed to parse all_chapters_link_sel: {}", e))?;
        let all_ch_link_post = doc
            .select(&all_chapters_link_sel)
            .next()
            .map(|el| get_val(&el, as_opt_str(&Some("href".to_string()))))
            .ok_or("No all_chapters_link found")?;
        let all_ch_link = format_join(&config.url, &all_ch_link_post);

        // partial book (without chapters)
        let book = BookInfo {
            title,
            cover_image,
            desc,
            tags,
            author,
            r#type: None,
            bookmarks: Some(bookmarks),
            created: None,
            status: Some(status),
            update,
            chapters: Vec::new(), // will be filled later
        };

        Ok((book, all_ch_link))
    }

    pub fn parse_chapters_from_html(
        selectors: &Sel,
        new_html: String,
    ) -> Result<Vec<EachChapter>, String> {
        let new_doc = Html::parse_document(&new_html);

        let e_chapters_sel = Selector::parse(&selectors.book_sel.chapter_list.sel)
            .map_err(|e| format!("chapter_list_sel: {}", e))?;
        let e_ch_n_sel = Selector::parse(&selectors.book_sel.chapter_list.number.sel)
            .map_err(|e| format!("chapter_list.number.sel: {}", e))?;
        let e_ch_l_sel = Selector::parse(&selectors.book_sel.chapter_list.link.sel)
            .map_err(|e| format!("chapter_list.link.sel: {}", e))?;

        let mut chapters = Vec::new();
        for e_ch in new_doc.select(&e_chapters_sel) {
            let e_ch_n = e_ch
                .select(&e_ch_n_sel)
                .next()
                .map(|el| get_direct_text(&el));
            let e_ch_l_post = e_ch
                .select(&e_ch_l_sel)
                .next()
                .map(|el| get_val(&el, as_opt_str(&selectors.book_sel.chapter_list.link.attr)))
                .unwrap_or_default();
            //
            let e_ch_l = Some(format_join(&selectors.url, &e_ch_l_post));

            chapters.push(EachChapter {
                chapter_name: None,
                chapter_number: e_ch_n.clone(),
                chapter_link: e_ch_l.clone(),
            });
        }

        Ok(chapters)
    }
}
