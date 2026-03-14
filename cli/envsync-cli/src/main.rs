use clap::Parser;

mod api;
mod cli;
mod commands;
mod config;
mod crypto;
mod error;

use cli::{Cli, Commands};

#[tokio::main]
async fn main() {
    let cli = Cli::parse();

    let api_url = cli.api_url.as_deref().unwrap_or("");

    let result = match cli.command {
        Commands::Login => commands::login::run(api_url).await,
        Commands::Logout => commands::logout::run(),
        Commands::Init { name, env } => commands::init::run(name, env, api_url).await,
        Commands::Push { message, force } => commands::push::run(message, force, api_url).await,
        Commands::Pull { force } => commands::pull::run(force, api_url).await,
        Commands::Diff { show_values } => commands::diff::run(show_values, api_url).await,
        Commands::Log { limit } => commands::log::run(limit, api_url).await,
        Commands::Set { key, value, message } => {
            commands::set::run(key, value, message, api_url).await
        }
        Commands::Unset { key, message } => commands::unset::run(key, message, api_url).await,
        Commands::Rollback { version, yes } => commands::rollback::run(version, yes, api_url).await,
        Commands::Status => async { commands::status::run() }.await,
    };

    if let Err(e) = result {
        eprintln!("Error: {e:#}");
        std::process::exit(1);
    }
}
