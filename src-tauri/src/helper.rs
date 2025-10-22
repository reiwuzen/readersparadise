use crate::models::{BookInfo, EachChapter};
use crate::sources::{Conf, Sel};
use scraper::ElementRef;
use scraper::{Html, Selector};

pub fn get_val(el: &ElementRef, attr: Option<&str>) -> String {
    if let Some(attribute) = attr {
        if let Some(val) = el.value().attr(attribute) {
            return val.to_string();
        }
    }
    // Fallback to text content
    el.text().collect::<String>().trim().to_string()
}
pub fn as_opt_str(opt: &Option<String>) -> Option<&str> {
    opt.as_deref()
}

/// Joins two strings safely, trimming leading '/' from the second part.
/// Example: format_join("https://example.com", "/path") → "https://example.com/path"
pub fn format_join(a: &str, b: &str) -> String {
    format!("{}{}", a, b.trim_start_matches('/'))
}

///
///
///
pub fn get_direct_text(el: &ElementRef) -> String {
    el.children()
        .filter_map(|node| node.value().as_text())
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join(" ")
}

//
pub fn clean_description(s: &str, unwanted: Option<&str>) -> String {
    let unwanted =
        unwanted.unwrap_or("You are reading  chapters on www.mgeko.cc fastest updating comic site");
    s.replace(unwanted, "").trim().to_string()
}

#[macro_export]
macro_rules! wrap_err {
    ($e:expr, $msg:expr) => {
        $e.map_err(|err| format!("{}: {}", $msg, err))
    };
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
        let e_ch_l = e_ch
            .select(&e_ch_l_sel)
            .next()
            .map(|el| get_val(&el, as_opt_str(&selectors.book_sel.chapter_list.link.attr)));

        chapters.push(EachChapter {
            chapter_name: None,
            chapter_number: e_ch_n.clone(),
            chapter_link: e_ch_l.clone(),
        });
    }

    Ok(chapters)
}
