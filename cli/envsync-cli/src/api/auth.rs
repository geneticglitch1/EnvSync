use anyhow::{anyhow, Result};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio::time::sleep;

#[derive(Debug, Serialize)]
struct DeviceAuthRequest {
    client_id: String,
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
pub struct TokenResponse {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_in: u64,
}

/// Exchange a refresh token for a new access token.
pub async fn refresh_token(
    client: &Client,
    keycloak_url: &str,
    client_id: &str,
    refresh_token: &str,
) -> Result<TokenResponse> {
    let token_url = format!("{keycloak_url}/protocol/openid-connect/token");
    let params = [
        ("grant_type", "refresh_token"),
        ("client_id", client_id),
        ("refresh_token", refresh_token),
    ];
    let resp = client.post(&token_url).form(&params).send().await?;
    let status = resp.status();
    let text = resp.text().await.unwrap_or_default();

    if status.is_success() {
        Ok(serde_json::from_str(&text)
            .map_err(|e| anyhow!("Failed to parse refresh response: {e}"))?)
    } else {
        Err(anyhow!("Token refresh failed ({status}): {text}"))
    }
}

pub async fn authenticate(
    client: &Client,
    keycloak_url: &str,
    client_id: &str,
) -> Result<TokenResponse> {
    let device_auth_url = format!("{keycloak_url}/protocol/openid-connect/auth/device");

    let params = [("client_id", client_id)];
    let response = client.post(&device_auth_url).form(&params).send().await?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        anyhow::bail!("Device auth failed ({status}): {body}");
    }

    let resp: DeviceAuthResponse = response.json().await?;

    println!("Open this URL in your browser:");
    println!("  {}", resp.verification_uri);
    println!("Enter the code: {}", resp.user_code);

    let token_url = format!("{keycloak_url}/protocol/openid-connect/token");
    let interval = Duration::from_secs(resp.interval.max(5));
    let start = std::time::Instant::now();

    loop {
        if start.elapsed().as_secs() >= resp.expires_in {
            anyhow::bail!("Authentication timed out. Please try again.");
        }

        sleep(interval).await;

        let params = [
            ("grant_type", "urn:ietf:params:oauth:grant-type:device_code"),
            ("device_code", &resp.device_code),
            ("client_id", client_id),
        ];
        let token_resp = client.post(&token_url).form(&params).send().await?;
        let status = token_resp.status();
        let text = token_resp.text().await.unwrap_or_default();

        if status.is_success() {
            let token: TokenResponse = serde_json::from_str(&text)?;
            return Ok(token);
        } else if status.as_u16() == 400
            && (text.contains("authorization_pending") || text.contains("slow_down"))
        {
            continue;
        } else {
            anyhow::bail!("Token request failed ({status}): {text}");
        }
    }
}
