use anyhow::{anyhow, Result};
use base64::{engine::general_purpose::STANDARD as B64, Engine as _};
use dialoguer::{Confirm, Password};
use sodiumoxide::crypto::secretbox;
use std::collections::BTreeMap;

use crate::api::vault::VaultClient;
use crate::config::{Config, LocalProject};
use crate::crypto;

pub async fn run(force: bool, api_url: &str) -> Result<()> {
    sodiumoxide::init().map_err(|_| anyhow!("Failed to initialize libsodium"))?;

    let config = Config::load()?;
    let auth = config.require_auth()?;
    let keypair = config.require_keypair()?;
    let effective_api_url = if !api_url.is_empty() { api_url } else { &config.api_url };
    let mut project = LocalProject::load()?;

    let vc = VaultClient::new(effective_api_url, &auth.access_token);

    let latest = match vc.get_latest_snapshot(&project.project_id).await? {
        Some(s) => s,
        None => {
            println!("No snapshots found for this project yet.");
            return Ok(());
        }
    };

    if !force && latest.version <= project.latest_version {
        println!("Already up to date (v{}).", project.latest_version);
        return Ok(());
    }

    let env_path = std::env::current_dir()?.join(".env");
    if !force && env_path.exists() {
        let proceed = Confirm::new()
            .with_prompt("This will overwrite your local .env. Continue?")
            .default(false)
            .interact()?;
        if !proceed {
            println!("Aborted.");
            return Ok(());
        }
    }

    // Derive vault key
    let passphrase = Password::new()
        .with_prompt("Passphrase")
        .interact()?;
    let salt_bytes = B64.decode(&keypair.argon2_salt)
        .map_err(|e| anyhow!("Failed to decode salt: {e}"))?;
    let salt: [u8; 32] = salt_bytes
        .try_into()
        .map_err(|_| anyhow!("Invalid salt length"))?;
    let vault_key = crypto::derive_key(&passphrase, &salt)?;

    // Decrypt
    let ciphertext = B64.decode(&latest.ciphertext)
        .map_err(|e| anyhow!("Failed to decode ciphertext: {e}"))?;
    let nonce_bytes = B64.decode(&latest.nonce)
        .map_err(|e| anyhow!("Failed to decode nonce: {e}"))?;
    let nonce = secretbox::Nonce::from_slice(&nonce_bytes)
        .ok_or_else(|| anyhow!("Invalid nonce length"))?;

    let plaintext = crypto::decrypt_vault(&ciphertext, &nonce, &vault_key)?;
    let env_map: BTreeMap<String, String> = serde_json::from_slice(&plaintext)?;

    write_env_file(&env_path, &env_map)?;

    project.latest_version = latest.version;
    project.save()?;

    println!("Pulled v{} → .env ({} keys)", latest.version, env_map.len());
    Ok(())
}

pub fn write_env_file(
    path: &std::path::Path,
    map: &BTreeMap<String, String>,
) -> Result<()> {
    let content: String = map
        .iter()
        .map(|(k, v)| format!("{k}={v}\n"))
        .collect();
    std::fs::write(path, content)?;
    Ok(())
}
