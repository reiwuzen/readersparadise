use chrono;
use serde::{Deserialize, Serialize};
use std::{fs, path::Path, path::PathBuf};
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
    build_type: String,
    timestamp: String,
}
// ---------- Helper: check images ------- //
fn is_image_file(path: &PathBuf) -> bool {
    if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
        matches!(ext.to_lowercase().as_str(), "jpg" | "jpeg" | "png" | "webp")
    } else {
        false
    }
}
fn find_image_dirs(base_path: &Path) -> Vec<PathBuf> {
    let mut image_dirs = Vec::new();
    if let Ok(entries) = fs::read_dir(base_path) {
        let mut has_image = false;
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() && is_image_file(&path) {
                has_image = true;
            } else if path.is_dir() {
                image_dirs.extend(find_image_dirs(&path));
            }
        }
        if has_image {
            image_dirs.push(base_path.to_path_buf());
        }
    }
    image_dirs
}
// ---------- Helper: timestamp ---------- //
pub fn current_time_string() -> String {
    chrono::Local::now().format("%H:%M").to_string()
}

// ---------- Core builder ---------- //
pub fn build_library(base_path: &str, r#type: &str, build_type: &str) -> Option<Library> {
    let base = PathBuf::from(base_path);
    if !base.exists() { return None; }

    let all_image_dirs = find_image_dirs(&base);
    if all_image_dirs.is_empty() { return None; }

    let mut book_stores: Vec<BookStore> = vec![];

    match build_type {
        "native" => {
            // folder with images = chapter; parent = book
            for dir in &all_image_dirs {
                let chapter_name = dir.file_name()?.to_string_lossy().to_string();
                let mut pages = Vec::new();

                if let Ok(entries) = fs::read_dir(dir) {
                    for entry in entries.flatten() {
                        let path = entry.path();
                        if path.is_file() && is_image_file(&path) {
                            pages.push(path.to_string_lossy().to_string());
                        }
                    }
                }
                pages.sort();

                let chapter = Chapter {
                    path: dir.to_string_lossy().to_string(),
                    chapter: ChapterData {
                        chapter_name,
                        chapter_pages_num: pages.len(),
                        chapter_pages: pages.clone(),
                    },
                };

                // parent folder = Book
                if let Some(parent) = dir.parent() {
                    let book_name = parent.file_name()?.to_string_lossy().to_string();
                    let existing = book_stores.iter_mut().find(|b| b.book.name == book_name);
                    if let Some(book) = existing {
                        book.book.chapters.push(chapter);
                        book.book.chapter_num = book.book.chapters.len();
                    } else {
                        book_stores.push(BookStore {
                            path: parent.to_string_lossy().to_string(),
                            book: BookData {
                                name: book_name,
                                chapter_num: 1,
                                chapters: vec![chapter],
                            },
                        });
                    }
                }
            }
        }
        "non_native" => {
            // folder with images = book directly
            for dir in &all_image_dirs {
                let book_name = dir.file_name()?.to_string_lossy().to_string();
                let mut pages = Vec::new();

                if let Ok(entries) = fs::read_dir(dir) {
                    for entry in entries.flatten() {
                        let path = entry.path();
                        if path.is_file() && is_image_file(&path) {
                            pages.push(path.to_string_lossy().to_string());
                        }
                    }
                }
                pages.sort();

                let chapter = Chapter {
                    path: dir.to_string_lossy().to_string(),
                    chapter: ChapterData {
                        chapter_name: book_name.clone(),
                        chapter_pages_num: pages.len(),
                        chapter_pages: pages.clone(),
                    },
                };

                book_stores.push(BookStore {
                    path: dir.to_string_lossy().to_string(),
                    book: BookData {
                        name: book_name,
                        chapter_num: 1,
                        chapters: vec![chapter],
                    },
                });
            }
        }
        _ => return None,
    }

    Some(Library {
        key: Uuid::new_v4().to_string(),
        path: base_path.to_string(),
        r#type: r#type.to_string(),
        timestamp: current_time_string(),
        book_store: book_stores,
    })
}

// ---------- Write multiple libraries ---------- //
#[command]
pub fn write_multiple_libraries(
    app: AppHandle,
    imported_json_path: &str,
) -> Result<String, String> {
    let imported_data = fs::read_to_string(imported_json_path)
        .map_err(|e| format!("Failed to read imported.json: {}", e))?;
    let libraries_ref: Vec<LibraryReference> = serde_json::from_str(&imported_data)
        .map_err(|e| format!("Failed to parse imported.json: {}", e))?;

    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    // --- Directories setup ---
    let info_dir = app_data_dir.join("data").join("info");
    fs::create_dir_all(&info_dir).map_err(|e| format!("Failed to create info dir: {}", e))?;

    // Determine import directory based on build_type
    let import_dir = match libraries_ref.first() {
        Some(first) => match first.build_type.as_str() {
            "native" => app_data_dir.join("data").join("import").join("native"),
            "non_native" => app_data_dir.join("data").join("import").join("non_native"),
            _ => app_data_dir.join("data").join("import").join("misc"),
        },
        None => app_data_dir.join("data").join("import").join("misc"),
    };
    fs::create_dir_all(&import_dir).map_err(|e| format!("Failed to create import dir: {}", e))?;

    // --- Scan existing library files ---
    let mut max_index = 0;
    let mut library_map: Vec<LibraryAll> = vec![];

    for entry in fs::read_dir(&import_dir).unwrap_or_else(|_| fs::read_dir(".").unwrap()) {
        let entry = entry.unwrap();
        let file_name = entry.file_name().to_string_lossy().to_string();
        if file_name.starts_with("library_") && file_name.ends_with(".json") {
            if let Ok(num) = file_name
                .trim_start_matches("library_")
                .trim_end_matches(".json")
                .parse::<usize>()
            {
                if num > max_index {
                    max_index = num;
                }
            }
        }
    }

    // --- Info file management ---
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

    // --- Build and save libraries ---
    let mut current_index = max_index;
    for lib_ref in libraries_ref.iter() {
        current_index += 1;

        let library = match build_library(&lib_ref.path, &lib_ref.r#type, &lib_ref.build_type) {
            Some(l) => l,
            None => continue,
        };

        let file_name = format!("library_{}.json", current_index);
        let file_path = import_dir.join(&file_name);

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

    // --- Write info_y.json ---
    let info_json = serde_json::to_string_pretty(&library_map)
        .map_err(|e| format!("Failed to serialize info map: {}", e))?;
    fs::write(&info_file_path, info_json)
        .map_err(|e| format!("Failed to write info file: {}", e))?;

    Ok(format!(
        "Processed {} libraries; data saved in {} and {}",
        libraries_ref.len(),
        import_dir.display(),
        info_file_path.display()
    ))
}
