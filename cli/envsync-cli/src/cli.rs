use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(
    name = "envsync",
    about = "Zero-knowledge encrypted environment variable manager",
    version
)]
pub struct Cli {
    /// API server URL (overrides config, env: ENVSYNC_API_URL)
    #[arg(long, env = "ENVSYNC_API_URL", global = true)]
    pub api_url: Option<String>,

    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Authenticate with EnvSync via device code flow
    Login,

    /// Log out and clear stored credentials
    Logout,

    /// Initialize a new project in the current directory
    Init {
        /// Project name (defaults to directory name)
        #[arg(long, short)]
        name: Option<String>,
        /// Environment (e.g. development, staging, production)
        #[arg(long, short, default_value = "development")]
        env: Option<String>,
    },

    /// Encrypt and push the local .env to the server
    Push {
        /// Commit message describing this snapshot
        #[arg(long, short)]
        message: Option<String>,
        /// Force push even when behind remote version
        #[arg(long)]
        force: bool,
    },

    /// Decrypt and pull the latest .env snapshot from the server
    Pull {
        /// Overwrite local .env without prompting
        #[arg(long)]
        force: bool,
    },

    /// Show diff between local .env and latest remote snapshot
    Diff {
        /// Print actual values instead of masking with ***
        #[arg(long)]
        show_values: bool,
    },

    /// Show snapshot history for this project
    Log {
        /// Maximum number of entries to display
        #[arg(long, short, default_value = "20")]
        limit: u32,
    },

    /// Set a key in the vault and push a new snapshot
    Set {
        key: String,
        value: String,
        /// Commit message
        #[arg(long, short)]
        message: Option<String>,
    },

    /// Remove a key from the vault and push a new snapshot
    Unset {
        key: String,
        /// Commit message
        #[arg(long, short)]
        message: Option<String>,
    },

    /// Roll back the vault to a specific snapshot version
    Rollback {
        /// Version number to restore
        version: u32,
        /// Skip confirmation prompt
        #[arg(long, short)]
        yes: bool,
    },

    /// Show current auth status and project configuration
    Status,
}
