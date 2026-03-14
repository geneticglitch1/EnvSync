use anyhow::{anyhow, Result};
use base64::{engine::general_purpose::STANDARD as B64, Engine as _};
use console::style;
use dialoguer::Password;
use sodiumoxide::crypto::secretbox;
use std::collections::BTreeMap;

use crate::api::vault::VaultClient;
use crate::config::{Config, LocalProject};
use crate::crypto;

pub async fn run(show_values: bool, api_url: &str) -> Result<()> {
    sodiumoxide::init().map_err(|_| anyhow!("Failed to initialize libsodium"))?;

    let config = Config::load()?;
    let auth = config.require_auth()?;
    let keypair = config.require_keypair()?;
    let effective_api_url = if !api_url.is_empty() { api_url } else { &config.api_url };
    let project = LocalProject::load()?;

    // Load local .env
    let env_path = std::env::current_dir()?.join(".env");
    let local_map: BTreeMap<String, String> = if env_path.exists() {
        let mut m = BTreeMap::new();
        for item in dotenvy::from_path_iter(&env_path)? {
            let (k, v) = item?;
            m.insert(k, v);
        }
        m
    } else {
        BTreeMap::new()
    };

    // Fetch remote
    let vc = VaultClient::new(effective_api_url, &auth.access_token);
    let remote_map = match vc.get_latest_snapshot(&project.project_id).await? {
        None => {
            println!("No remote snapshot found. All local keys are new:");
            for k in local_map.keys() {
                let display = if show_values {
                    local_map[k].as_str().to_string()
                } else {
                    "***".to_string()
                };
                println!("  {}", style(format!("+{k}={display}")).green());
            }
            return Ok(());
        }
        Some(snap) => {
            let passphrase = Password::new()
                .with_prompt("Passphrase")
                .interact()?;
            let salt_bytes = B64.decode(&keypair.argon2_salt)
                .map_err(|e| anyhow!("Failed to decode salt: {e}"))?;
            let salt: [u8; 32] = salt_bytes
                .try_into()
                .map_err(|_| anyhow!("Invalid salt length"))?;
            let vault_key = crypto::derive_key(&passphrase, &salt)?;

            let ciphertext = B64.decode(&snap.ciphertext)
                .map_err(|e| anyhow!("Failed to decode ciphertext: {e}"))?;
            let nonce_bytes = B64.decode(&snap.nonce)
                .map_err(|e| anyhow!("Failed to decode nonce: {e}"))?;
            let nonce = secretbox::Nonce::from_slice(&nonce_bytes)
                .ok_or_else(|| anyhow!("Invalid nonce length"))?;

            let plaintext = crypto::decrypt_vault(&ciphertext, &nonce, &vault_key)?;
            let m: BTreeMap<String, String> = serde_json::from_slice(&plaintext)?;
            m
        }
    };

    let all_keys: std::collections::BTreeSet<&String> =
        local_map.keys().chain(remote_map.keys()).collect();

    let mut has_diff = false;
    for key in all_keys {
        match (local_map.get(key), remote_map.get(key)) {
            (Some(lv), Some(rv)) if lv == rv => {} // unchanged
            (Some(lv), Some(rv)) => {
                has_diff = true;
                if show_values {
                    println!("  {}", style(format!("~{key}: {rv} → {lv}")).yellow());
                } else {
                    println!("  {}", style(format!("~{key}")).yellow());
                }
            }
            (Some(lv), None) => {
                has_diff = true;
                let display = if show_values { lv.as_str() } else { "***" };
                println!("  {}", style(format!("+{key}={display}")).green());
            }
            (None, Some(rv)) => {
                has_diff = true;
                let display = if show_values { rv.as_str() } else { "***" };
                println!("  {}", style(format!("-{key}={display}")).red());
            }
            (None, None) => {}
        }
    }

    if !has_diff {
        println!("No differences — local matches remote.");
    }
    Ok(())
}
