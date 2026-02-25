use anyhow::Result;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio::time::sleep;

#[derive(Debug, Serialize)]
struct DeviceAuthRequest {
    client_id: String,
    client_secret: String,
}

#[derive(Debug, Deserialize)]
struct DeviceAuthResponse {
    device_code: String,
    user_code: String,
    verification_uri: String,
    interval: u64,
    expires_in: u64,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct TokenResponse {
    access_token: String,
    refresh_token: Option<String>,
    expires_in: u64,
}

pub async fn authenticate(client: &Client, keycloak_url: &str, client_id: &str) -> Result<String> {
    // 1. Request device code
    let device_auth_url = format!("{}/protocol/openid-connect/auth/device", keycloak_url);

    let params = [
        ("client_id", client_id),
    ];
    let response = client.post(&device_auth_url).form(&params).send().await?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        anyhow::bail!("Device auth failed ({}): {}", status, body);
    }

    let resp: DeviceAuthResponse = response.json().await?;

    println!("Open this URL in your browser: {}", resp.verification_uri);
    println!("Enter the code: {}", resp.user_code);

    // 2. Poll for token
    let token_url = format!("{}/protocol/openid-connect/token", keycloak_url);
    let interval = Duration::from_secs(resp.interval);
    let start = std::time::Instant::now();

    while start.elapsed().as_secs() < resp.expires_in {
        let params = [
            ("grant_type", "urn:ietf:params:oauth:grant-type:device_code"),
            ("device_code", &resp.device_code),
            ("client_id", client_id),
        ];
        let token_resp = client.post(&token_url).form(&params).send().await?;

        let status = token_resp.status();
        let text = token_resp.text().await.unwrap_or_default();
        println!("Token response status: {}, body: {}", status, text);

        if status.is_success() {
            let token: TokenResponse = serde_json::from_str(&text)?;
            return Ok(token.access_token);
        } else if status.as_u16() == 400 && text.contains("authorization_pending") {
            sleep(interval).await;
        } else {
            anyhow::bail!("Unexpected token response: {} - {}", status, text);
        }
    }

    anyhow::bail!("Authentication timed out");
}