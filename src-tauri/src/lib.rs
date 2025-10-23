// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod data;
pub mod cmd;
pub mod book;
pub mod import;
pub mod full_import;
pub mod discover;
pub mod sources;
pub mod models;
pub mod client;
pub mod helper;
pub mod mgeko;
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init()) 
        .invoke_handler(tauri::generate_handler![
            greet,
            cmd::open_folder_and_list_items,
            cmd::read_image_base64,
            import::register_fs_scope,
            import::select_and_register_folder,
            import::import_selected_folder,
            import::import_book,
            // sources::check_sources,
            discover::get_book_info,
            discover::search_book,
            discover::get_book_chapter,
            data::reset_downloads_dir,
            data::reset_src_dir,
            data::reset_cache_dir,
            data::reset_data_dir,
            data::get_app_path,
            sources::download_1_chapter,
            // discover::fetch_chapter_images,

            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
