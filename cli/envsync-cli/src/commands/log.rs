use anyhow::Result;
use comfy_table::{Cell, Color, Table};

use crate::api::vault::VaultClient;
use crate::config::{Config, LocalProject};

pub async fn run(limit: u32, api_url: &str) -> Result<()> {
    let config = Config::load()?;
    let auth = config.require_auth()?;
    let effective_api_url = if !api_url.is_empty() { api_url } else { &config.api_url };
    let project = LocalProject::load()?;

    let vc = VaultClient::new(effective_api_url, &auth.access_token);
    let snapshots = vc.list_snapshots(&project.project_id, limit).await?;

    if snapshots.is_empty() {
        println!("No snapshots found for '{}'.", project.project_name);
        return Ok(());
    }

    let mut table = Table::new();
    table.set_header(vec!["", "Version", "Date", "Message"]);

    for snap in &snapshots {
        let current_marker = if snap.version == project.latest_version {
            "*"
        } else {
            ""
        };
        let msg = snap.message.as_deref().unwrap_or("-");
        let version_cell = if snap.version == project.latest_version {
            Cell::new(snap.version).fg(Color::Green)
        } else {
            Cell::new(snap.version)
        };
        table.add_row(vec![
            Cell::new(current_marker),
            version_cell,
            Cell::new(&snap.created_at),
            Cell::new(msg),
        ]);
    }

    println!("Project: {} ({})", project.project_name, project.environment);
    println!("{table}");
    Ok(())
}
