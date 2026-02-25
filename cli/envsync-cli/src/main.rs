// main.rs
use anyhow::Result;
use reqwest::Client;

// Import your authenticate function from the module where you defined it
mod api;
use api::auth::authenticate;

#[tokio::main]
async fn main() -> Result<()> {
    let keycloak_url = std::env::var("KEYCLOAK_URL")
        .unwrap_or_else(|_| "http://localhost:8180/realms/envsync".to_string());
    let client_id = std::env::var("KEYCLOAK_CLIENT_ID")
        .unwrap_or_else(|_| "envsync-app-cli".to_string());

    // Create an HTTP client
    let client = Client::new();

    // Call the authentication function and also need to wait fot the user to complete the authentication in the browser
    let token = authenticate(&client, &keycloak_url, &client_id).await?;

    println!("Access Token: {}", token);

    Ok(())


}