use anyhow::Result;
use chrono::{DateTime, Utc};

use crate::config::{Config, LocalProject};

pub fn run() -> Result<()> {
    let config = Config::load()?;

    println!("EnvSync Status");
    println!("{}", "─".repeat(40));

    // Auth status
    match &config.auth {
        None => {
            println!("Auth:     not logged in");
            println!("          Run 'envsync login' to authenticate.");
        }
        Some(auth) => {
            let now = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs() as i64;

            let expires_in = auth.expires_at - now;
            let expiry_str = if expires_in > 0 {
                let dt = DateTime::<Utc>::from_timestamp(auth.expires_at, 0)
                    .map(|d| d.format("%H:%M:%S UTC").to_string())
                    .unwrap_or_else(|| "unknown".into());
                format!("expires at {dt} ({expires_in}s)")
            } else {
                "EXPIRED — run 'envsync login'".to_string()
            };

            println!("Auth:     logged in");
            println!("User:     {}", auth.user_email);
            println!("Token:    {expiry_str}");
            println!("Refresh:  {}", if auth.refresh_token.is_some() { "available" } else { "none" });
        }
    }

    println!("{}", "─".repeat(40));

    // Keypair status
    match &config.keypair {
        None => println!("Keypair:  not generated"),
        Some(kp) => println!("Keypair:  {} (X25519)", &kp.public_key[..16]),
    }

    println!("{}", "─".repeat(40));

    // Local project status
    match LocalProject::load() {
        Err(_) => println!("Project:  no .envsync file (run 'envsync init')"),
        Ok(proj) => {
            println!("Project:  {}", proj.project_name);
            println!("Env:      {}", proj.environment);
            println!("Local v:  v{}", proj.latest_version);
            println!("ID:       {}", proj.project_id);
        }
    }

    println!("{}", "─".repeat(40));
    println!("API:      {}", config.api_url);
    println!("Keycloak: {}", config.keycloak_url);

    Ok(())
}
