use chrono;
use serde::{Deserialize, Serialize};
use std::{fs, io::Write, path::PathBuf};
use tauri::{command, AppHandle, Manager};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct ChapterData {
    chapter_name: String,
    chapter_pages: Vec<String>,
    chapter_pages_num: usize,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Chapter {
    path: String,
    chapter: ChapterData,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct BookData {
    name: String,
    chapter_num: usize,
    chapters: Vec<Chapter>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct BookStore {
    path: String,
    book: BookData,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Library {
    key: String,
    path: String,
    r#type: String,
    timestamp: String,
    book_store: Vec<BookStore>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LibraryAll {
    library_key: String,
    library_path: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LibraryReference {
    path: String,
    r#type: String,
    timestamp: String,
}

// ---------- Helper: timestamp ---------- //
pub fn current_time_string() -> String {
    chrono::Local::now().format("%H:%M").to_string()
}

// ---------- Core builder ---------- //
pub fn build_library(base_path: &str, r#type: &str) -> Option<Library> {
    if !PathBuf::from(base_path).exists() {
        return None;
    }

    let mut book_stores = vec![];

    for book_entry in fs::read_dir(base_path).ok()? {
        let book_entry = book_entry.ok()?;
        let book_path = book_entry.path();
        if !book_path.is_dir() { continue; }

        let book_name = book_path.file_name()?.to_string_lossy().to_string();
        if !book_name.starts_with("RP-book-") { continue; }

        let mut chapters = vec![];
        for chapter_entry in fs::read_dir(&book_path).ok()? {
            let chapter_entry = chapter_entry.ok()?;
            let chapter_path = chapter_entry.path();
            if !chapter_path.is_dir() { continue; }

            let chapter_name = chapter_path.file_name()?.to_string_lossy().to_string();
            let expected_prefix = format!("RP-book-{}-chapter-", book_name.trim_start_matches("RP-book-"));
            if !chapter_name.starts_with(&expected_prefix) { continue; }

            let mut pages = vec![];
            for page_entry in fs::read_dir(&chapter_path).ok()? {
                let page_entry = page_entry.ok()?;
                let page_path = page_entry.path();
                if page_path.is_file() {
                    if let Some(ext) = page_path.extension().and_then(|s| s.to_str()) {
                        if ["jpg", "jpeg", "png", "webp"].contains(&ext) {
                            pages.push(page_path.to_string_lossy().to_string());
                        }
                    }
                }
            }
            pages.sort();

            chapters.push(Chapter {
                path: chapter_path.to_string_lossy().to_string(),
                chapter: ChapterData {
                    chapter_name,
                    chapter_pages: pages.clone(),
                    chapter_pages_num: pages.len(),
                },
            });
        }

        book_stores.push(BookStore {
            path: book_path.to_string_lossy().to_string(),
            book: BookData {
                name: book_name,
                chapter_num: chapters.len(),
                chapters,
            },
        });
    }

    let library = Library {
        key: Uuid::new_v4().to_string(),
        path: base_path.to_string(),
        r#type: r#type.to_string(),
        timestamp: current_time_string(),
        book_store: book_stores,
    };

    Some(library)
}

// ---------- Write multiple libraries ---------- //
#[command]
pub fn write_multiple_libraries(app: AppHandle, imported_json_path: &str) -> Result<String, String> {
    let imported_data = fs::read_to_string(imported_json_path)
        .map_err(|e| format!("Failed to read imported.json: {}", e))?;
    let libraries_ref: Vec<LibraryReference> = serde_json::from_str(&imported_data)
        .map_err(|e| format!("Failed to parse imported.json: {}", e))?;

    let app_data_dir = app.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    let library_dir = app_data_dir.join("data").join("library");
    let info_dir = app_data_dir.join("data").join("info");
    fs::create_dir_all(&library_dir)
        .map_err(|e| format!("Failed to create library dir: {}", e))?;
    fs::create_dir_all(&info_dir)
        .map_err(|e| format!("Failed to create info dir: {}", e))?;

    // Scan existing library_*.json files
    let mut max_index = 0;
    let mut library_map: Vec<LibraryAll> = vec![];

    for entry in fs::read_dir(&library_dir).unwrap_or_else(|_| fs::read_dir(".").unwrap()) {
        let entry = entry.unwrap();
        let file_name = entry.file_name().to_string_lossy().to_string();
        if file_name.starts_with("library_") && file_name.ends_with(".json") {
            if let Ok(num) = file_name.trim_start_matches("library_")
                                     .trim_end_matches(".json")
                                     .parse::<usize>() {
                if num > max_index {
                    max_index = num;
                }
            }
        }
    }

    // Scan info files
    let info_files: Vec<_> = fs::read_dir(&info_dir)
        .unwrap_or_else(|_| fs::read_dir(".").unwrap())
        .filter_map(|e| e.ok())
        .collect();
    let info_file_path = if info_files.is_empty() {
        info_dir.join("info_1.json")
    } else {
        let last = info_files.last().unwrap().path();
        last
    };

    // Iterate and build libraries
    let mut current_index = max_index;
    for lib_ref in libraries_ref.iter() {
        current_index += 1;

        let library = match build_library(&lib_ref.path, &lib_ref.r#type) {
            Some(l) => l,
            None => continue,
        };

        let file_name = format!("library_{}.json", current_index);
        let file_path = library_dir.join(&file_name);

        // Write new or update existing
        if !file_path.exists() {
            let library_json = serde_json::to_string_pretty(&library)
                .map_err(|e| format!("Failed to serialize library: {}", e))?;
            fs::write(&file_path, library_json)
                .map_err(|e| format!("Failed to write JSON: {}", e))?;
        }

        library_map.push(LibraryAll {
            library_key: library.key.clone(),
            library_path: file_path.to_string_lossy().to_string(),
        });
    }

    // Write info_y.json
    let info_json = serde_json::to_string_pretty(&library_map)
        .map_err(|e| format!("Failed to serialize info map: {}", e))?;
    fs::write(&info_file_path, info_json)
        .map_err(|e| format!("Failed to write info file: {}", e))?;

    Ok(format!(
        "Processed {} libraries; data saved in {} and {}",
        libraries_ref.len(),
        library_dir.display(),
        info_file_path.display()
    ))
}
