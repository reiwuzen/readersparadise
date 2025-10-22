use tauri::{command,  AppHandle};
// use tokio::{fs as tokio_fs, select};


//crates

use crate::models::{
    BookInfo,  SearchResults, 
};

//
use crate::mgeko::Mgeko;
use crate::wrap_err;
//


//fn

#[command]
pub async fn search_book(query: String, app: AppHandle) -> Result<Vec<SearchResults>, String> {
    // Load all sources (could be mgeko, src2, src3...)
    let sources = vec![
        wrap_err!(Mgeko::load_all(&app), "Failed to load mgeko source")?,
        // wrap_err!(Src2::load_all(&app), "Failed to load src2")?,
        // wrap_err!(Src3::load_all(&app), "Failed to load src3")?,
    ];

    let mut combined_results = Vec::new();

    for src in sources {
        let res = wrap_err!(src.search(query.clone()).await, "Failed to get results from source")?;
        combined_results.extend(res); // Push all results at once
    }

    Ok(combined_results)
}

#[command]
pub async fn get_book_info(
    link: String,
    source_name: String,
    app: AppHandle,
) -> Result<BookInfo, String> {
    let mgeko =wrap_err!(Mgeko::load_all(&app), "Failed to load mgeko source")?;
    //
    let res = wrap_err!(mgeko.get_book(link).await, "Failed to get results from source")?;
    //
    Ok(res)
}

#[command]
pub async fn get_book_chapter(
    link: String,
    app: AppHandle
) -> Result<Vec<String>,String >{
    let mgeko =wrap_err!(Mgeko::load_all(&app), "Failed to load mgeko source")?;
    let res = wrap_err!(mgeko.get_chapter(link).await, "Failed to get results from source")?;
    Ok(res)
}