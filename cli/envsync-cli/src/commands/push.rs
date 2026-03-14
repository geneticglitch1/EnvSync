use anyhow::{anyhow, Result};
use base64::{engine::general_purpose::STANDARD as B64, Engine as _};
use dialoguer::Password;
use std::collections::BTreeMap;
use std::path::Path;

use crate::api::vault::{PushSnapshotRequest, VaultClient};
use crate::config::{Config, LocalProject};
use crate::crypto;

pub async fn run(message: Option<String>, force: bool, api_url: &str) -> Result<()> {
    sodiumoxide::init().map_err(|_| anyhow!("Failed to initialize libsodium"))?;

    let config = Config::load()?;
    let auth = config.require_auth()?;
    let keypair = config.require_keypair()?;
    let effective_api_url = if !api_url.is_empty() { api_url } else { &config.api_url };
    let mut project = LocalProject::load()?;

    let env_path = std::env::current_dir()?.join(".env");
    if !env_path.exists() {
        anyhow::bail!("No .env file found in the current directory.");
    }

    // Prompt passphrase and derive vault key
    let passphrase = Password::new()
        .with_prompt("Passphrase")
        .interact()?;
    let salt_bytes = B64.decode(&keypair.argon2_salt)
        .map_err(|e| anyhow!("Failed to decode salt: {e}"))?;
    let salt: [u8; 32] = salt_bytes
        .try_into()
        .map_err(|_| anyhow!("Invalid salt length"))?;
    let vault_key = crypto::derive_key(&passphrase, &salt)?;

    // Parse .env → BTreeMap (deterministic ordering)
    let env_map = parse_env_file(&env_path)?;
    let plaintext = serde_json::to_vec(&env_map)?;

    // Encrypt
    let (ciphertext, nonce) = crypto::encrypt_vault(&plaintext, &vault_key)?;

    let vc = VaultClient::new(effective_api_url, &auth.access_token);

    // Conflict check
    if !force {
        if let Some(latest) = vc.get_latest_snapshot(&project.project_id).await? {
            if latest.version > project.latest_version {
                anyhow::bail!(
                    "Remote is at v{}, you have v{}. Run 'envsync pull' first or use --force.",
                    latest.version,
                    project.latest_version
                );
            }
        }
    }

    let snap = vc
        .push_snapshot(
            &project.project_id,
            PushSnapshotRequest {
                ciphertext: B64.encode(&ciphertext),
                nonce: B64.encode(nonce.0),
                message,
            },
        )
        .await?;

    project.latest_version = snap.version;
    project.save()?;

    println!(
        "Pushed v{} to '{}' ({})",
        snap.version, project.project_name, project.environment
    );
    Ok(())
}

pub fn parse_env_file(path: &Path) -> Result<BTreeMap<String, String>> {
    let mut map = BTreeMap::new();
    for item in dotenvy::from_path_iter(path)? {
        let (k, v) = item?;
        map.insert(k, v);
    }
    Ok(map)
}
