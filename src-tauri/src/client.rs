use once_cell::sync::Lazy;
use reqwest::Client;

pub static HTTP_CLIENT: Lazy<Client> = Lazy::new(|| {
    Client::builder()
        .user_agent("Mozilla/5.0 (compatible; RustScraper/1.0)")
        .build()
        .expect("Failed to create client")
});
