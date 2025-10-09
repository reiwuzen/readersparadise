// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod cmd;
pub mod book;
pub mod import;
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init()) // 👈 enable dialog
        .invoke_handler(tauri::generate_handler![
            greet,
            cmd::open_folder_and_list_items,
            cmd::read_image_base64,
            import::register_fs_scope,
            import::select_and_register_folder,
            import::import_selected_folder,
            
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
