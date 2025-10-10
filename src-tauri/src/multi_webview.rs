// use tauri::{AppHandle, LogicalPosition, LogicalSize, WebviewUrl, Window};

// pub struct ChildWebview {
//     pub id: String,
//     pub url: WebviewUrl,
// }

// pub fn add_child_webviews(window: &Window, children: Vec<ChildWebview>) -> tauri::Result<()> {
//     let parent_size = window.inner_size()?; // Get main window size
//     let parent_width = parent_size.width as f64;
//     let parent_height = parent_size.height as f64;

//     let n = children.len() as f64;
//     let cols = (n.sqrt().ceil()) as usize; // simple grid logic
//     let rows = (n as f64 / cols as f64).ceil() as usize;

//     for (i, child) in children.into_iter().enumerate() {
//         let row = i / cols;
//         let col = i % cols;

//         let child_width = parent_width / cols as f64;
//         let child_height = parent_height / rows as f64;

//         window.add_child(
//             tauri::webview::WebviewBuilder::new(&child.id, child.url)
//                 .auto_resize(),
//             LogicalPosition::new(col as f64 * child_width, row as f64 * child_height),
//             LogicalSize::new(child_width, child_height),
//         )?;
//     }

//     Ok(())
// }
