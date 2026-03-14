use thiserror::Error;

#[derive(Debug, Error)]
pub enum EnvSyncError {
    #[error("Not authenticated. Run 'envsync login' first.")]
    NotAuthenticated,

    #[error("No project found. Run 'envsync init' in your project directory.")]
    NoProject,

    #[error("API error ({status}): {message}")]
    ApiError { status: u16, message: String },

    #[error("Crypto error: {0}")]
    CryptoError(String),

    #[error("Config error: {0}")]
    ConfigError(String),

    #[error("Push conflict: remote has newer version. Use --force to override.")]
    PushConflict,

    #[error("Snapshot version {0} not found.")]
    SnapshotNotFound(u32),

    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error(transparent)]
    Serde(#[from] serde_json::Error),

    #[error(transparent)]
    Http(#[from] reqwest::Error),
}
