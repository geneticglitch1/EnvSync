use anyhow::{anyhow, Result};
use base64::{engine::general_purpose::STANDARD as B64, Engine as _};
use dialoguer::Password;
use sodiumoxide::crypto::secretbox;
use std::collections::BTreeMap;

use crate::api::vault::{PushSnapshotRequest, VaultClient};
use crate::config::{Config, LocalProject};
use crate::crypto;

pub async fn run(key: String, value: String, message: Option<String>, api_url: &str) -> Result<()> {
    sodiumoxide::init().map_err(|_| anyhow!("Failed to initialize libsodium"))?;

    let config = Config::load()?;
    let auth = config.require_auth()?;
    let keypair = config.require_keypair()?;
    let effective_api_url = if !api_url.is_empty() { api_url } else { &config.api_url };
    let mut project = LocalProject::load()?;

    let passphrase = Password::new()
        .with_prompt("Passphrase")
        .interact()?;
    let salt_bytes = B64.decode(&keypair.argon2_salt)
        .map_err(|e| anyhow!("Failed to decode salt: {e}"))?;
    let salt: [u8; 32] = salt_bytes
        .try_into()
        .map_err(|_| anyhow!("Invalid salt length"))?;
    let vault_key = crypto::derive_key(&passphrase, &salt)?;

    let vc = VaultClient::new(effective_api_url, &auth.access_token);

    // Pull current remote state (or start fresh)
    let mut env_map: BTreeMap<String, String> =
        match vc.get_latest_snapshot(&project.project_id).await? {
            Some(snap) => {
                let ct = B64.decode(&snap.ciphertext)
                    .map_err(|e| anyhow!("Failed to decode ciphertext: {e}"))?;
                let nonce_bytes = B64.decode(&snap.nonce)
                    .map_err(|e| anyhow!("Failed to decode nonce: {e}"))?;
                let nonce = secretbox::Nonce::from_slice(&nonce_bytes)
                    .ok_or_else(|| anyhow!("Invalid nonce length"))?;
                let plaintext = crypto::decrypt_vault(&ct, &nonce, &vault_key)?;
                serde_json::from_slice(&plaintext)?
            }
            None => BTreeMap::new(),
        };

    env_map.insert(key.clone(), value.clone());

    let plaintext = serde_json::to_vec(&env_map)?;
    let (ct, nonce) = crypto::encrypt_vault(&plaintext, &vault_key)?;

    let msg = message.unwrap_or_else(|| format!("Set {key}"));
    let snap = vc
        .push_snapshot(
            &project.project_id,
            PushSnapshotRequest {
                ciphertext: B64.encode(&ct),
                nonce: B64.encode(nonce.0),
                message: Some(msg),
            },
        )
        .await?;

    // Update local .env
    let env_path = std::env::current_dir()?.join(".env");
    crate::commands::pull::write_env_file(&env_path, &env_map)?;

    project.latest_version = snap.version;
    project.save()?;

    println!("Set {key}={value} → pushed v{}", snap.version);
    Ok(())
}
