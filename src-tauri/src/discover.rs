use tauri::{command,  AppHandle};
// use tokio::{fs as tokio_fs, select};


//crates

use crate::book::{PageStruct, Series};
use crate::models::{
   
};

//
use crate::mgeko::{self, Mgeko};
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

#[command]
pub async fn get_book(app:AppHandle, series: Series)->Result<Series,String>{
    let mgkeo = Mgeko::load_all(&app)?;
    let z = mgkeo.get_book(series).await?;

    // println!("this ran from discover get_book: z:{:#?}",z);
    Ok(z)
}

#[command]
pub async fn get_chapter(app:AppHandle,series: Series, url: String)->Result<Series,String>{
    let mgkeo = Mgeko::load_all(&app)?;
    let z = mgkeo.get_chapter(series,url).await?;
    Ok(z)
}