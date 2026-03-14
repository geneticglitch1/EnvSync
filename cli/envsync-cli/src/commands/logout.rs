use anyhow::Result;

use crate::config::Config;

pub fn run() -> Result<()> {
    let mut config = Config::load()?;

    if config.auth.is_none() {
        println!("Not currently logged in.");
        return Ok(());
    }

    let email = config
        .auth
        .as_ref()
        .map(|a| a.user_email.as_str())
        .unwrap_or("unknown")
        .to_string();

    config.auth = None;
    // Keep the keypair — user can re-authenticate without re-generating keys.
    config.save()?;

    println!("Logged out ({email}).");
    Ok(())
}
