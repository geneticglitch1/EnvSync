use anyhow::{Result, Context, anyhow};
use directories::ProjectDirs;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use sodiumoxide::crypto::box__;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AuthConfig {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at: chrono::DateTime<chrono::Utc>,
    pub user_id: String,
    pub user_email: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct KeypairConfig {
    pub public_key: String,  // base64 encoded
    pub private_key: String, // base64 encrypted with a passphrase?
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct VaultContext {
    pub project_id: String,
    pub project_name: String,
    pub environment: String,
    pub vault_key: Option<String>, // base64 encrypted with user's public key
}

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct Config {
    pub api_url: String,
    pub auth: Option<AuthConfig>,
    pub keypair: Option<KeypairConfig>,
    pub current_context: Option<VaultContext>,
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
                .with_context(|| format!("Failed to read config from {:?}", path))?;
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

    pub fn get_auth_token(&self) -> Result<String> {
        self.auth
            .as_ref()
            .map(|a| a.access_token.clone())
            .ok_or_else(|| anyhow!("Not authenticated. Run 'envsync init' first."))
    }

    pub fn get_current_context(&self) -> Result<&VaultContext> {
        self.current_context
            .as_ref()
            .ok_or_else(|| anyhow!("No project initialized. Run 'envsync init' in your project."))
    }

    pub fn set_current_context(&mut self, context: VaultContext) {
        self.current_context = Some(context);
    }
}

#[derive(Debug, Clone)]
pub struct ProjectConfig {
    pub project_name: String,
    pub environment: String,
    pub env_file_path: PathBuf,
}

impl ProjectConfig {
    pub fn from_current_dir(project_name: Option<String>, environment: Option<String>) -> Result<Self> {
        let current_dir = std::env::current_dir()?;

        // Look for existing .env file
        let env_file_path = current_dir.join(".env");

        // If project name not provided, use directory name
        let project_name = match project_name {
            Some(name) => name,
            None => current_dir
                .file_name()
                .and_then(|n| n.to_str())
                .ok_or_else(|| anyhow!("Could not determine project name from directory"))?
                .to_string(),
        };

        let environment = environment.unwrap_or_else(|| "development".to_string());

        Ok(ProjectConfig {
            project_name,
            environment,
            env_file_path,
        })
    }
}