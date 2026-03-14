use anyhow::{anyhow, Context, Result};
use base64::Engine as _;
use directories::ProjectDirs;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

fn default_api_url() -> String {
    "http://localhost:8081".to_string()
}

fn default_keycloak_url() -> String {
    "http://localhost:8180/realms/envsync".to_string()
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct AuthConfig {
    pub access_token: String,
    pub refresh_token: Option<String>,
    /// Unix timestamp (seconds since epoch)
    pub expires_at: i64,
    pub user_id: String,
    pub user_email: String,
}

/// X25519 keypair — private key is encrypted with the Argon2id-derived master key.
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct KeypairConfig {
    /// base64 X25519 public key (32 bytes)
    pub public_key: String,
    /// base64 encrypted private key ciphertext
    pub private_key_ct: String,
    /// base64 nonce used to encrypt the private key (24 bytes)
    pub privkey_nonce: String,
    /// base64 Argon2id salt (32 bytes)
    pub argon2_salt: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    #[serde(default = "default_api_url")]
    pub api_url: String,
    #[serde(default = "default_keycloak_url")]
    pub keycloak_url: String,
    pub auth: Option<AuthConfig>,
    pub keypair: Option<KeypairConfig>,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            api_url: default_api_url(),
            keycloak_url: default_keycloak_url(),
            auth: None,
            keypair: None,
        }
    }
}

impl Config {
    pub fn path() -> PathBuf {
        ProjectDirs::from("com", "envsync", "cli")
            .expect("Failed to get config directory")
            .config_dir()
            .join("config.toml")
    }

    pub fn load() -> Result<Self> {
        let path = Self::path();
        if path.exists() {
            let content = fs::read_to_string(&path)
                .with_context(|| format!("Failed to read config from {path:?}"))?;
            Ok(toml::from_str(&content)?)
        } else {
            Ok(Config::default())
        }
    }

    pub fn save(&self) -> Result<()> {
        let path = Self::path();
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        let content = toml::to_string_pretty(self)?;
        fs::write(&path, content)?;
        Ok(())
    }

    pub fn require_auth(&self) -> Result<&AuthConfig> {
        self.auth
            .as_ref()
            .ok_or_else(|| anyhow!("Not authenticated. Run 'envsync login' first."))
    }

    /// Returns a valid AuthConfig, automatically refreshing the access token if it has
    /// expired (or will expire within 60 seconds) and a refresh token is available.
    pub async fn require_valid_auth(&mut self) -> Result<&AuthConfig> {
        let auth = self
            .auth
            .as_ref()
            .ok_or_else(|| anyhow!("Not authenticated. Run 'envsync login' first."))?;

        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;

        // Token still valid (with 60-second buffer)
        if auth.expires_at > now + 60 {
            return Ok(self.auth.as_ref().unwrap());
        }

        // Attempt refresh if we have a refresh token
        let refresh_tok = match auth.refresh_token.clone() {
            Some(rt) if !rt.is_empty() => rt,
            _ => {
                anyhow::bail!(
                    "Access token expired. Run 'envsync login' to re-authenticate."
                );
            }
        };

        let client = reqwest::Client::new();
        let keycloak_url = self.keycloak_url.clone();

        let new_tokens =
            crate::api::auth::refresh_token(&client, &keycloak_url, "envsync-app-cli", &refresh_tok)
                .await
                .map_err(|e| anyhow!("Session expired. Run 'envsync login' to re-authenticate. ({e})"))?;

        // Decode new expiry from JWT
        let exp = decode_jwt_exp(&new_tokens.access_token).unwrap_or(now + new_tokens.expires_in as i64);

        let existing = self.auth.as_ref().unwrap();
        self.auth = Some(AuthConfig {
            access_token: new_tokens.access_token,
            refresh_token: new_tokens.refresh_token.or_else(|| existing.refresh_token.clone()),
            expires_at: exp,
            user_id: existing.user_id.clone(),
            user_email: existing.user_email.clone(),
        });
        self.save()?;

        Ok(self.auth.as_ref().unwrap())
    }

    pub fn require_keypair(&self) -> Result<&KeypairConfig> {
        self.keypair
            .as_ref()
            .ok_or_else(|| anyhow!("No keypair found. Run 'envsync login' first."))
    }
}

fn decode_jwt_exp(token: &str) -> Option<i64> {
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 3 {
        return None;
    }
    let bytes = base64::engine::general_purpose::URL_SAFE_NO_PAD
        .decode(parts[1])
        .ok()?;
    let claims: serde_json::Value = serde_json::from_slice(&bytes).ok()?;
    claims["exp"].as_i64()
}

/// Per-repository state stored in `.envsync` (gitignored).
#[derive(Serialize, Deserialize, Debug, Default)]
pub struct LocalProject {
    pub project_id: String,
    pub project_name: String,
    pub environment: String,
    pub latest_version: u32,
}

impl LocalProject {
    pub fn path() -> PathBuf {
        std::env::current_dir()
            .expect("Failed to get current directory")
            .join(".envsync")
    }

    pub fn load() -> Result<Self> {
        let path = Self::path();
        if !path.exists() {
            anyhow::bail!(
                "No project found in current directory. Run 'envsync init' first."
            );
        }
        let content = fs::read_to_string(&path)?;
        Ok(toml::from_str(&content)?)
    }

    pub fn save(&self) -> Result<()> {
        let path = Self::path();
        let content = toml::to_string_pretty(self)?;
        fs::write(&path, content)?;
        Ok(())
    }
}
