use crate::{book::{Series, SitesEnum},
//  downloads,
  mgeko::{
    // self,
     Mgeko}, user::get_user_config};
use tokio::fs as tokio_fs;
use futures::stream::{self, StreamExt};
use reqwest;
use std::path::PathBuf;

#[tauri::command]
pub async fn download_all_chapters(
    app: tauri::AppHandle,
    _series: Series,
) -> Result<Series, String> {

    let mut series = match _series.site {
        SitesEnum::Mgeko => {
            let mgeko = Mgeko::load_all(&app)?;
            mgeko.download_all_chapters_helper(_series).await.unwrap_or_default()
        },
        SitesEnum::EHentai => _series,
        SitesEnum::Hentai2Read => _series,
        SitesEnum::HentaiFox => _series,
        SitesEnum::HentaiRead => _series,
    };

    let user_conf = get_user_config(app)?;
    let downloads_path = user_conf.download_path.join("series");
    let series_path = downloads_path.join(&series.title);

    tokio_fs::create_dir_all(&series_path)
        .await
        .map_err(|e| format!("Failed to create series dir {:?}: {}", &series_path, e))?;

    let concurrency_limit = user_conf.concurrent_download_limit as usize;

    for e_ch in &mut series.chapters {
        let chapter_path = series_path.join(&e_ch.title);
        tokio_fs::create_dir_all(&chapter_path)
            .await
            .map_err(|e| format!("Failed to create chapter dir {:?}: {}", &chapter_path, e))?;

        // ✅ Step 1: extract owned list (no borrowing of &mut)
        let download_jobs: Vec<(usize, String, PathBuf)> = e_ch
            .pages
            .iter()
            .enumerate()
            .map(|(i, pgs)| {
                let url = pgs.url.clone();
                let file_path = chapter_path.join(format!("{:03}.jpg", i + 1));
                (i, url, file_path)
            })
            .collect();

        // ✅ Step 2: build async stream from owned values
        let stream = stream::iter(download_jobs.into_iter().map(|(i, url, file_path)| async move {
            match reqwest::get(&url).await {
                Ok(resp) => match resp.bytes().await {
                    Ok(bytes) => {
                        tokio_fs::write(&file_path, &bytes)
                            .await
                            .map_err(|e| format!("Failed to write {:?}: {}", file_path, e))?;
                        Ok((i, file_path))
                    }
                    Err(e) => Err(format!("Failed to read bytes for {}: {}", url, e)),
                },
                Err(e) => Err(format!("Failed to fetch {}: {}", url, e)),
            }
        }));

        // ✅ Step 3: run with limited concurrency
        let results: Vec<_> = stream
            .buffer_unordered(concurrency_limit)
            .collect()
            .await;

        // ✅ Step 4: safely mutate original structure after awaits
        for res in results {
            match res {
                Ok((idx, path)) => {
                    if let Some(p) = path.to_str() {
                        e_ch.pages[idx].path = p.to_string();
                    }
                }
                Err(e) => eprintln!("{}", e),
            }
        }
    }

    Ok(series)
}
