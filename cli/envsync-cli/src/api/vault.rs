use reqwest::Client;
use serde::{Deserialize, Serialize};

use crate::error::EnvSyncError;

// ── Request types ──────────────────────────────────────────────────────────

#[derive(Serialize)]
pub struct CreateProjectRequest {
    pub name: String,
    pub environment: String,
}

#[derive(Serialize)]
pub struct PushSnapshotRequest {
    pub ciphertext: String,
    pub nonce: String,
    pub message: Option<String>,
}

#[derive(Serialize)]
struct RegisterPubkeyRequest {
    public_key: String,
}

// ── Response types ─────────────────────────────────────────────────────────

#[derive(Deserialize, Debug)]
pub struct ProjectResponse {
    pub id: String,
    pub name: String,
    pub environment: String,
    pub created_at: String,
}

#[derive(Deserialize, Debug)]
pub struct SnapshotMetaResponse {
    pub id: String,
    pub version: u32,
    pub message: Option<String>,
    pub created_at: String,
}

#[derive(Deserialize, Debug)]
pub struct SnapshotFullResponse {
    pub id: String,
    pub version: u32,
    pub ciphertext: String,
    pub nonce: String,
    pub message: Option<String>,
    pub created_at: String,
}

// ── Client ─────────────────────────────────────────────────────────────────

pub struct VaultClient {
    client: Client,
    api_url: String,
    token: String,
}

impl VaultClient {
    pub fn new(api_url: impl Into<String>, token: impl Into<String>) -> Self {
        Self {
            client: Client::new(),
            api_url: api_url.into(),
            token: token.into(),
        }
    }

    async fn check(&self, resp: reqwest::Response) -> Result<reqwest::Response, EnvSyncError> {
        if !resp.status().is_success() {
            let status = resp.status().as_u16();
            let message = resp.text().await.unwrap_or_default();
            return Err(EnvSyncError::ApiError { status, message });
        }
        Ok(resp)
    }

    pub async fn create_project(
        &self,
        name: &str,
        environment: &str,
    ) -> Result<ProjectResponse, EnvSyncError> {
        let resp = self
            .client
            .post(format!("{}/api/projects", self.api_url))
            .bearer_auth(&self.token)
            .json(&CreateProjectRequest {
                name: name.to_string(),
                environment: environment.to_string(),
            })
            .send()
            .await?;
        Ok(self.check(resp).await?.json().await?)
    }

    pub async fn list_projects(&self) -> Result<Vec<ProjectResponse>, EnvSyncError> {
        let resp = self
            .client
            .get(format!("{}/api/projects", self.api_url))
            .bearer_auth(&self.token)
            .send()
            .await?;
        Ok(self.check(resp).await?.json().await?)
    }

    pub async fn push_snapshot(
        &self,
        project_id: &str,
        req: PushSnapshotRequest,
    ) -> Result<SnapshotMetaResponse, EnvSyncError> {
        let resp = self
            .client
            .post(format!("{}/api/projects/{project_id}/snapshots", self.api_url))
            .bearer_auth(&self.token)
            .json(&req)
            .send()
            .await?;
        Ok(self.check(resp).await?.json().await?)
    }

    pub async fn get_latest_snapshot(
        &self,
        project_id: &str,
    ) -> Result<Option<SnapshotFullResponse>, EnvSyncError> {
        let resp = self
            .client
            .get(format!(
                "{}/api/projects/{project_id}/snapshots/latest",
                self.api_url
            ))
            .bearer_auth(&self.token)
            .send()
            .await?;

        if resp.status().as_u16() == 404 {
            return Ok(None);
        }
        Ok(Some(self.check(resp).await?.json().await?))
    }

    pub async fn list_snapshots(
        &self,
        project_id: &str,
        limit: u32,
    ) -> Result<Vec<SnapshotMetaResponse>, EnvSyncError> {
        let resp = self
            .client
            .get(format!(
                "{}/api/projects/{project_id}/snapshots?limit={limit}",
                self.api_url
            ))
            .bearer_auth(&self.token)
            .send()
            .await?;
        Ok(self.check(resp).await?.json().await?)
    }

    pub async fn get_snapshot(
        &self,
        project_id: &str,
        snap_id: &str,
    ) -> Result<SnapshotFullResponse, EnvSyncError> {
        let resp = self
            .client
            .get(format!(
                "{}/api/projects/{project_id}/snapshots/{snap_id}",
                self.api_url
            ))
            .bearer_auth(&self.token)
            .send()
            .await?;
        Ok(self.check(resp).await?.json().await?)
    }

    pub async fn register_pubkey(&self, public_key: &str) -> Result<(), EnvSyncError> {
        let resp = self
            .client
            .put(format!("{}/api/users/me/pubkey", self.api_url))
            .bearer_auth(&self.token)
            .json(&RegisterPubkeyRequest {
                public_key: public_key.to_string(),
            })
            .send()
            .await?;
        self.check(resp).await?;
        Ok(())
    }
}
