// use chrono;
use serde::{Deserialize, Serialize};
use std::{fs, path::Path, path::PathBuf};
use tauri::{command, AppHandle, Manager};
use tokio::fs as tokio_fs;
// use uuid::Uuid;

///
#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum SitesEnum {
    Mgeko,
    EHentai,
    Hentai2Read,
    HentaiRead,
    HentaiFox,
}
///
///
#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum AvailabilityStatus {
    Downloaded,
    Downloading,
    Queued,
    Failed,
    Online,
}
///
///
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ChapterStruct {
    pub order: i32,
    pub title: String,
    pub url: String,
    pub path: String,
    pub pages: Vec<PageStruct>,
}
///
///
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct PageStruct {
    pub order: i32,
    pub url: String,
    pub path: String,
    pub availability: AvailabilityStatus,
    pub is_read: bool,
}
///
///
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct AttributeStruct {
    pub status: SeriesStatusEnum,
    pub authors: AttrItemStruct,
    pub tags: Vec<AttrItemStruct>,
    pub category: AttrItemStruct,
}
///
///
#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum SeriesStatusEnum {
    Ongoing,
    Stopped,
    Completed,
    Hiatus,
}
///
///
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct AttrItemStruct {
    pub name: String,
    pub url: String,
    pub path: String,
}
///

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Series {
    pub id: String,
    pub site: SitesEnum,
    pub title: String,
    pub alt_title: String,
    pub cover_img_url: String,
    pub chapter_count: usize,
    pub desc: String,
    pub favorite: bool,
    pub reads: i32,
    pub availability: AvailabilityStatus,
    pub chapters: Vec<ChapterStruct>,
    pub attributes: AttributeStruct,
}

///default for the AttributeStruct
impl Default for AttributeStruct {
    fn default() -> Self {
        Self {
            status: SeriesStatusEnum::Ongoing,
            authors: AttrItemStruct {
                name: String::new(),
                url: String::new(),
                path: String::new(),
            },
            tags: Vec::new(),
            category: AttrItemStruct {
                name: String::new(),
                url: String::new(),
                path: String::new(),
            },
        }
    }
}

///default for the Series
impl Default for Series {
    fn default() -> Self {
        Self {
            id: String::new(),
            site: SitesEnum::Mgeko,
            title: String::new(),
            alt_title: String::new(),
            cover_img_url: String::new(),
            chapter_count: 0,
            desc: String::new(),
            favorite: false,
            reads: 0,
            availability: AvailabilityStatus::Online,
            chapters: Vec::new(),
            attributes: AttributeStruct {
                status: SeriesStatusEnum::Ongoing,
                authors: AttrItemStruct {
                    name: String::new(),
                    url: String::new(),
                    path: String::new(),
                },
                tags: Vec::new(),
                category: AttrItemStruct {
                    name: String::new(),
                    url: String::new(),
                    path: String::new(),
                },
            },
        }
    }
}

impl Series {}
