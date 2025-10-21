use serde_json::Value;
use std::{fs, path::PathBuf};
use tauri::AppHandle;
use tauri::Manager;
use serde::{Deserialize, Serialize};

//crates
use crate::models::{SearchResults, Selectors, Sources, BookInfo};
use crate::mgeko::Mgeko;

//traits
pub trait F {
    fn is_selected(&self) -> bool;
    fn is_nsfw(&self) -> bool;
    fn is_main(&self) -> bool;
    fn is_fav(&self) -> bool;
    fn is_all(&self) -> bool;
}


pub trait SrcLoad{
    fn load_all(app:&AppHandle) -> Result<Mgeko, String>;
}

//struct
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ESel {
    pub sel: String,
    pub attr: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct StatsSel {
    pub sel: String,
    pub latest_chapter_sel: ESel,
    pub update_sel: Option<ESel>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SearchSel {
    pub main_sel: String,
    pub link_sel: ESel,
    pub title_sel: ESel,
    pub cover_img_sel: ESel,
    pub authors_sel: ESel,
    pub stats_sel: StatsSel,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct AltTitleSel {
    pub sel: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct BookTitleSel {
    pub sel: String,
    pub atl_title_sel: Option<AltTitleSel>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ChapterLink {
    pub sel: String,
    pub attr: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ChapterNumber {
    pub sel: String,
    pub update: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ChapterList {
    pub sel: String,
    pub link: ChapterLink,
    pub number: ChapterNumber,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct BookStats {
    pub sel: String,
    pub latest_chapter_sel: ESel,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct BookSel {
    pub cover_img_sel: ESel,
    pub title_sel: BookTitleSel,
    pub author_sel: ESel,
    pub stats: BookStats,
    pub update_info: ESel,
    pub categories: ESel,
    pub desc: ESel,
    pub chapter_list: ChapterList,
}

// --- Selectors wrapper ---
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Sel {
    pub name: String,
    pub url: String,
    pub search_url: String,
    pub search_sel: SearchSel,
    pub book_sel: BookSel,
}

// --- Config struct ---
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Conf {
    pub name: String,
    pub url: String,
    pub search_url: String,
    pub is_selected: bool,
    pub is_nsfw: bool,
    pub is_main: bool,
    pub is_fav: bool,
    pub is_all: bool,
}
