// src/models/source.rs
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

//elemental structs
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ElementSelector {
    pub selector: String,
    pub attr: Option<String>,
    pub alt_selector: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ListSelector {
    pub selector: String,
    pub attr: Option<String>,
    pub time_selector: Option<ElementSelector>,
}

//complex selectors
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SearchSelectors {
    pub main_div_selectors: String,
    pub title_selector: ElementSelector,
    pub link_selector: ElementSelector,
    pub latest_chapter_selector: Option<ElementSelector>,
    pub cover_image_selector: ElementSelector,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct InfoSelectors {
    pub author_selector: ElementSelector,
    pub cover_image_selector: ElementSelector,
    pub status_selector: ElementSelector,
    pub type_selector: ElementSelector,
    pub bookmarks_selector: ElementSelector,
    pub created_selector: ElementSelector,
    pub update_selector: ElementSelector,
    pub title_selector: ElementSelector,
    pub desc_selector: ElementSelector,
    pub chapters_selector: ListSelector,
    pub tags_selector: ElementSelector,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct EachChapterSelectors {
    pub chapter_id: String,
    pub chapter_api: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Selectors {
    pub name: String,
    pub options: Vec<String>,
    pub is_nsfw: bool,
    pub is_selected: bool,
    pub r#type: String,
    pub url: String,
    pub starts: Vec<String>,
    pub search_pattern: String,
    pub search_selectors: SearchSelectors,
    pub info_selectors: InfoSelectors,
    pub each_chapter_selectors: EachChapterSelectors,
    pub chapter_number_regex: Option<String>,

    pub chapter_api: Option<String>,
    pub chapter_api_method: Option<String>,
    pub chapter_id_regex: Option<String>,
    pub response_type: Option<String>,
    pub response_html_field: Option<String>,
    pub image_list_selector: Option<String>,
    pub image_attr_list: Option<Vec<String>>,
    pub max_pages: Option<usize>,
}

// search Results
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SearchResults{
    pub source_name: String,
    pub title:String,
    pub link:String,
    pub cover_image: String,
    pub latest_chapter:Option<String>,
    pub desc: Option<String>,
}

//each chapter
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct EachChapter{
    pub chapter_name: Option<String>,
    pub chapter_number: Option<String>,
    pub chapter_link: Option<String>,
}

//bookInfo
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct BookInfo{
    pub title: String,
    pub cover_image: String,
    pub desc: Option<String>,
    pub author: String,
    pub r#type: Option<String>,
    pub status: Option<String>,
    pub bookmarks: Option<String>,
    pub created: Option<String>,
    pub update: Option<String>,
    pub chapters: Vec<EachChapter>,
    pub tags: Vec<String>
}


#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Source{
    pub name: String,
    pub url: String,
    pub search_url: String,
    pub is_selected: bool,
    pub is_nsfw: bool,
    pub is_main: bool,
    pub is_fav: bool,
    pub is_all: bool,
}

pub type Sources = HashMap<String, Source>;


//traits
pub trait F {
    fn is_selected(&self) -> bool;
    fn is_nsfw(&self) -> bool;
    fn is_main(&self) -> bool;
    fn is_fav(&self) -> bool;
    fn is_all(&self) -> bool;
}