use anyhow::Result;
use dialoguer::{Confirm, Input};
use std::fs;

use crate::api::vault::VaultClient;
use crate::config::{Config, LocalProject};

pub async fn run(
    name: Option<String>,
    env: Option<String>,
    api_url: &str,
) -> Result<()> {
    let config = Config::load()?;
    let auth = config.require_auth()?;
    let effective_api_url = if !api_url.is_empty() { api_url } else { &config.api_url };

    // Determine defaults from current directory
    let cwd = std::env::current_dir()?;
    let default_name = cwd
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("my-project")
        .to_string();

    let project_name: String = if let Some(n) = name {
        n
    } else {
        Input::new()
            .with_prompt("Project name")
            .default(default_name)
            .interact_text()?
    };

    let environment: String = if let Some(e) = env {
        e
    } else {
        Input::new()
            .with_prompt("Environment")
            .default("development".to_string())
            .interact_text()?
    };

    println!("Creating project '{project_name}' ({environment})...");

    // Check .envsync doesn't already exist
    if LocalProject::path().exists() {
        let overwrite = Confirm::new()
            .with_prompt("A .envsync file already exists. Re-initialize?")
            .default(false)
            .interact()?;
        if !overwrite {
            println!("Aborted.");
            return Ok(());
        }
    }

    let vc = VaultClient::new(effective_api_url, &auth.access_token);
    let project = vc.create_project(&project_name, &environment).await?;

    let local = LocalProject {
        project_id: project.id.clone(),
        project_name: project.name.clone(),
        environment: project.environment.clone(),
        latest_version: 0,
    };
    local.save()?;

    // Ensure .envsync is in .gitignore
    add_to_gitignore(&cwd)?;

    println!("Initialized project '{}' (id: {})", project.name, project.id);
    println!("  Environment : {}", project.environment);
    println!("  .envsync    : written (gitignored)");
    Ok(())
}

fn add_to_gitignore(dir: &std::path::Path) -> Result<()> {
    let path = dir.join(".gitignore");
    if path.exists() {
        let content = fs::read_to_string(&path)?;
        if !content.lines().any(|l| l.trim() == ".envsync") {
            let sep = if content.ends_with('\n') || content.is_empty() { "" } else { "\n" };
            fs::write(&path, format!("{content}{sep}.envsync\n"))?;
        }
    } else {
        fs::write(&path, ".envsync\n")?;
    }
    Ok(())
}
