use anyhow::{anyhow, Result};
use base64::{engine::general_purpose::STANDARD as B64, Engine as _};
use dialoguer::{Confirm, Password};
use sodiumoxide::crypto::secretbox;
use std::collections::BTreeMap;

use crate::api::vault::{PushSnapshotRequest, VaultClient};
use crate::config::{Config, LocalProject};
use crate::crypto;

pub async fn run(version: u32, yes: bool, api_url: &str) -> Result<()> {
    sodiumoxide::init().map_err(|_| anyhow!("Failed to initialize libsodium"))?;

    let config = Config::load()?;
    let auth = config.require_auth()?;
    let keypair = config.require_keypair()?;
    let effective_api_url = if !api_url.is_empty() { api_url } else { &config.api_url };
    let mut project = LocalProject::load()?;

    let vc = VaultClient::new(effective_api_url, &auth.access_token);

    // Find the snapshot with the target version
    let snapshots = vc.list_snapshots(&project.project_id, 1000).await?;
    let target_meta = snapshots
        .iter()
        .find(|s| s.version == version)
        .ok_or_else(|| anyhow!("Snapshot v{version} not found."))?;

    println!(
        "Rolling back to v{} — {} — {}",
        target_meta.version,
        target_meta.created_at,
        target_meta.message.as_deref().unwrap_or("-")
    );

    if !yes {
        let confirmed = Confirm::new()
            .with_prompt("This will push a new snapshot with the content from that version. Continue?")
            .default(false)
            .interact()?;
        if !confirmed {
            println!("Aborted.");
            return Ok(());
        }
    }

    // Fetch full snapshot
    let snap = vc.get_snapshot(&project.project_id, &target_meta.id).await?;

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
    let ciphertext = B64.decode(&snap.ciphertext)
        .map_err(|e| anyhow!("Failed to decode ciphertext: {e}"))?;
    let nonce_bytes = B64.decode(&snap.nonce)
        .map_err(|e| anyhow!("Failed to decode nonce: {e}"))?;
    let nonce = secretbox::Nonce::from_slice(&nonce_bytes)
        .ok_or_else(|| anyhow!("Invalid nonce length"))?;
    let plaintext = crypto::decrypt_vault(&ciphertext, &nonce, &vault_key)?;
    let env_map: BTreeMap<String, String> = serde_json::from_slice(&plaintext)?;

    // Re-encrypt with a fresh nonce and push as new snapshot (preserves history)
    let (new_ct, new_nonce) = crypto::encrypt_vault(&plaintext, &vault_key)?;
    let new_snap = vc
        .push_snapshot(
            &project.project_id,
            PushSnapshotRequest {
                ciphertext: B64.encode(&new_ct),
                nonce: B64.encode(new_nonce.0),
                message: Some(format!("Rollback to v{version}")),
            },
        )
        .await?;

    // Write .env
    let env_path = std::env::current_dir()?.join(".env");
    crate::commands::pull::write_env_file(&env_path, &env_map)?;

    project.latest_version = new_snap.version;
    project.save()?;

    println!(
        "Rolled back to v{version} content → pushed as v{} ({} keys)",
        new_snap.version,
        env_map.len()
    );
    Ok(())
}
