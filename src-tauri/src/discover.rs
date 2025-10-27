use tauri::{command,  AppHandle};
// use tokio::{fs as tokio_fs, select};


//crates

use crate::book::Series;
use crate::models::{
   
};

//
use crate::mgeko::Mgeko;
use crate::wrap_err;
//


//fn

#[command]
pub async fn search_book(app:AppHandle, query: String) -> Result<Vec<Series>,String>{
    let mgkeo = Mgeko::load_all(&app)?;
    let mut res=Vec::new();
    let z =mgkeo.search_mgeko(query).await?;
    res.extend(z);

    Ok(res)
}