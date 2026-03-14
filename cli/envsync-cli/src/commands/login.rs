use anyhow::{anyhow, Result};
use base64::{engine::general_purpose::STANDARD as B64, engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use dialoguer::Password;
use reqwest::Client;

use crate::api::auth;
use crate::api::vault::VaultClient;
use crate::config::{AuthConfig, Config, KeypairConfig};
use crate::crypto;

pub async fn run(api_url: &str) -> Result<()> {
    sodiumoxide::init().map_err(|_| anyhow!("Failed to initialize libsodium"))?;

    let mut config = Config::load()?;
    let keycloak_url = config.keycloak_url.clone();
    let effective_api_url = if !api_url.is_empty() { api_url } else { &config.api_url };

    println!("Authenticating with EnvSync...");
    let client = Client::new();
    let token_resp = auth::authenticate(&client, &keycloak_url, "envsync-app-cli").await?;

    // Decode JWT payload (middle segment, URL-safe base64 without padding)
    let parts: Vec<&str> = token_resp.access_token.split('.').collect();
    if parts.len() != 3 {
        anyhow::bail!("Invalid JWT format received from Keycloak");
    }
    let payload_bytes = URL_SAFE_NO_PAD
        .decode(parts[1])
        .map_err(|e| anyhow!("Failed to decode JWT payload: {e}"))?;
    let claims: serde_json::Value = serde_json::from_slice(&payload_bytes)?;

    let user_id = claims["sub"].as_str().unwrap_or("").to_string();
    let user_email = claims["email"].as_str().unwrap_or("").to_string();
    let exp = claims["exp"].as_i64().unwrap_or(0);

    // Generate keypair on first login
    let keypair_config = if config.keypair.is_none() {
        println!("Generating a new encryption keypair...");
        let passphrase = Password::new()
            .with_prompt("Enter a passphrase to protect your private key")
            .with_confirmation("Confirm passphrase", "Passphrases do not match")
            .interact()?;

        let salt = crypto::generate_salt();
        let master_key = crypto::derive_key(&passphrase, &salt)?;
        let (pub_key, sec_key) = crypto::generate_keypair();
        let (ct, nonce) = crypto::encrypt_privkey(&sec_key, &master_key)?;

        KeypairConfig {
            public_key: B64.encode(pub_key.0),
            private_key_ct: B64.encode(&ct),
            privkey_nonce: B64.encode(nonce.0),
            argon2_salt: B64.encode(salt),
        }
    } else {
        println!("Using existing keypair.");
        config.keypair.clone().unwrap()
    };

    // Register public key with the backend
    let vc = VaultClient::new(effective_api_url, &token_resp.access_token);
    if let Err(e) = vc.register_pubkey(&keypair_config.public_key).await {
        eprintln!("Warning: failed to register public key with server: {e}");
    }

    config.auth = Some(AuthConfig {
        access_token: token_resp.access_token,
        refresh_token: token_resp.refresh_token,
        expires_at: exp,
        user_id: user_id.clone(),
        user_email: user_email.clone(),
    });
    config.keypair = Some(keypair_config);
    config.save()?;

    println!("Logged in as {user_email} (sub: {user_id})");
    Ok(())
}
