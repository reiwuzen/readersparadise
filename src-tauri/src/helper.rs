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

#[macro_export]
macro_rules! get_app {
    ($e:expr) => {
        $e.path()
            .app_data_dir()
            .map_err(|e| format!("Failed to get app data dir: {}", e))?
    };
}
