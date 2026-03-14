<div align="center">

# 🔐 EnvSync
## 🚧 Under Development

### Encrypted `.env` Collaboration — Git for your secrets.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![Rust](https://img.shields.io/badge/Rust-CLI-CE422B?style=flat-square&logo=rust)](https://www.rust-lang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)](https://redis.io/)
[![MinIO](https://img.shields.io/badge/MinIO-Object_Storage-C72E49?style=flat-square&logo=minio)](https://min.io/)
[![Keycloak](https://img.shields.io/badge/Keycloak-IAM-4D9B9B?style=flat-square)](https://www.keycloak.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

> Stop sending `.env` files over Slack. Stop wondering if your teammate has the latest secrets. EnvSync is a CLI + web dashboard that gives your team a single encrypted source of truth for environment variables — with diffing, versioning, and real-time notifications. **100% self-hosted. Zero cloud dependencies.**

</div>

---

## 🚨 The Problem

Every dev team has this conversation:

> _"Hey did you add the new `STRIPE_WEBHOOK_SECRET` to your `.env`?"_
> _"Wait there's a new one? Since when?"_

Environment variable drift causes bugs that are impossible to reproduce, broken local setups, and secrets leaking through Slack DMs. EnvSync fixes this — and keeps everything on your own infrastructure.

---

## ✨ Features

- **CLI-first workflow** — `envsync push`, `envsync pull`, `envsync diff` — feels like git for your `.env`
- **End-to-end encryption** — secrets encrypted client-side with `libsodium` (XSalsa20-Poly1305) before ever hitting the server
- **Zero-knowledge by design** — server only stores ciphertext; no one can read your secrets without your passphrase
- **Argon2id key derivation** — memory-hard KDF protects against brute force
- **Versioned snapshots** — every push creates an immutable version; rollback to any previous state
- **Environment scoping** — separate vaults for `development`, `staging`, `production`
- **Web dashboard** — manage projects, browse snapshot history, and copy CLI commands
- **Audit trail** — every push records who pushed it and when
- **Keycloak SSO** — enterprise-grade identity: OIDC login, MFA, LDAP, team provisioning
- **100% self-hosted** — Docker Compose one-liner; nothing phones home

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CLI Tool (Rust)                       │
│      envsync push / pull / diff / rollback / log        │
│         XSalsa20-Poly1305 + Argon2id (client-side)      │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS · E2E Encrypted Payload
┌────────────────────────▼────────────────────────────────┐
│               Spring Boot API (port 8081)               │
│         Auth · Vault CRUD · Snapshot versioning         │
└──────┬──────────────────┬──────────────────┬────────────┘
       │                  │                  │
┌──────▼──────┐   ┌───────▼──────┐   ┌──────▼──────┐
│  PostgreSQL │   │    Redis     │   │    MinIO    │
│  Vaults &   │   │  Pub/Sub     │   │   Encrypted │
│  Snapshots  │   │  (planned)   │   │   Backups   │
└─────────────┘   └──────────────┘   └─────────────┘

┌─────────────────────────────────────────────────────────┐
│                     Keycloak (port 8180)                │
│          SSO · OIDC · OAuth2 Device Code Flow           │
└─────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│             Next.js Dashboard (port 3000)               │
│         Projects · Snapshot history · CLI guide         │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | Next.js (App Router) | 15/16 |
| **Backend** | Spring Boot | 3.x / Java 21 |
| **CLI** | Rust | 2024 Edition |
| **Database** | PostgreSQL | 15 |
| **Cache / Pub-Sub** | Redis | 7 |
| **Object Storage** | MinIO | latest |
| **Identity / Auth** | Keycloak (OIDC) | latest |
| **CLI Encryption** | libsodium (sodiumoxide) | XSalsa20-Poly1305 |
| **Key Derivation** | Argon2id | 64 MB, 3 iterations |

---

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Java 21+ (for backend development)
- Node.js 20+ (for frontend development)
- Rust toolchain (for CLI development)

### 1. Clone & Start Infrastructure

```bash
git clone https://github.com/yourusername/envsync.git
cd envsync
docker compose up -d
# Starts: PostgreSQL (5432), Redis (6379), MinIO (9000/9001),
#         Keycloak (8180), pgAdmin (5050)
```

### 2. Configure Keycloak

```
Open http://localhost:8180
Admin credentials: admin / admin

1. Create realm: "envsync"
2. Create client: "envsync-app"
   - Client authentication: ON
   - Valid redirect URIs: http://localhost:3000/*
3. Create client: "envsync-app-cli"
   - OAuth 2.0 Device Authorization Grant: enabled
4. Create a test user in the realm
```

### 3. Start the Backend

```bash
cd backend
./mvnw spring-boot:run
# API at http://localhost:8081
```

The backend auto-creates tables via Hibernate DDL (`ddl-auto=update`). No migrations needed.

### 4. Start the Frontend

```bash
cd frontend
cp .env.example .env.local   # fill in Keycloak client credentials
npm install
npm run dev
# Dashboard at http://localhost:3000
```

Required environment variables (`.env.local`):

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-32-char-string>
KEYCLOAK_CLIENT_ID=envsync-frontend
KEYCLOAK_CLIENT_SECRET=<from-keycloak-console>
KEYCLOAK_ISSUER=http://localhost:8180/realms/envsync
NEXT_PUBLIC_API_URL=http://localhost:8081
```

### 5. Build & Use the CLI

```bash
cd cli/envsync-cli
cargo build --release
# Binary at: ./target/release/envsync

# Or add to PATH:
cargo install --path .
```

---

## 📖 CLI Reference

```bash
# Authentication
envsync login                         # OAuth2 device code flow via Keycloak
envsync logout                        # clear stored credentials
envsync status                        # show auth status, project, token expiry

# Project initialization (run in your project directory)
envsync init                          # interactive — prompts for name & env
envsync init --project my-app --env development

# Vault operations
envsync push                          # encrypt & push local .env → vault
envsync push -m "add stripe webhook"  # with a commit message
envsync push --force                  # skip conflict check
envsync pull                          # pull latest snapshot → local .env
envsync pull --force                  # skip confirmation prompt

# Inspection
envsync diff                          # diff local .env vs latest remote snapshot
envsync diff --show-values            # show actual values (not masked)
envsync log                           # snapshot history (last 20)
envsync log --limit 50

# Mutation helpers
envsync set DATABASE_URL "postgres://..." -m "update db url"
envsync unset OLD_API_KEY

# History
envsync rollback --version 12         # restore vault to v12 content (creates new snapshot)
envsync rollback --version 12 --yes   # skip confirmation
```

**Global flags:**

```bash
envsync --api-url http://my-server:8081 <command>
# or: export ENVSYNC_API_URL=http://my-server:8081
```

---

## 🔒 Security Model

EnvSync uses a **zero-knowledge encryption** model:

1. **Key derivation** — your passphrase → 32-byte secret key via Argon2id (64 MB, 3 iterations, 1 thread)
2. **Client-side encrypt** — `.env` → JSON → XSalsa20-Poly1305 encryption with a random nonce; ciphertext is base64-encoded
3. **Server stores ciphertext only** — PostgreSQL never sees plaintext; the server physically cannot read your secrets
4. **X25519 keypair** — generated on first login, private key encrypted with your master key; public key registered with the server for future team-sharing features
5. **Identity via Keycloak** — supports MFA, LDAP federation, social login; CLI uses OAuth2 Device Code flow (no browser required)
6. **Token auto-refresh** — CLI automatically refreshes expired access tokens using the stored refresh token

---

## 📁 Project Structure

```
envsync/
├── frontend/               # Next.js dashboard
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Landing page
│       │   ├── dashbaord/            # Dashboard (authenticated)
│       │   │   ├── page.tsx          # Projects list
│       │   │   ├── layout.tsx        # Sidebar navigation
│       │   │   └── projects/[id]/    # Project detail + snapshots
│       │   └── api/auth/             # NextAuth Keycloak handler
│       └── lib/
│           ├── auth.ts               # NextAuth options
│           └── api.ts                # Backend API client
│
├── backend/                # Spring Boot 3 REST API
│   └── src/main/java/com/envsync/backend/
│       ├── controller/     # ProjectController, SnapshotController, UserController
│       ├── service/        # ProjectService, SnapshotService, UserPubkeyService
│       ├── model/          # JPA entities: Project, Snapshot, UserPubkey
│       ├── repository/     # Spring Data JPA repositories
│       ├── dto/            # Request/Response DTOs
│       ├── SecurityConfig.java      # CORS + JWT + OAuth2 Resource Server
│       └── GlobalExceptionHandler.java  # Validation + error responses
│
└── cli/envsync-cli/        # Rust CLI
    └── src/
        ├── commands/       # login, logout, init, push, pull, diff,
        │                   # log, set, unset, rollback, status
        ├── api/            # vault.rs (HTTP client), auth.rs (device code + refresh)
        ├── crypto.rs       # Argon2id + XSalsa20-Poly1305 + X25519
        ├── config.rs       # Config persistence + auto token refresh
        └── cli.rs          # clap CLI definition
```

---

## 🔌 API Reference

All endpoints require `Authorization: Bearer <keycloak-token>`.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/projects` | Create project |
| `GET` | `/api/projects` | List my projects |
| `GET` | `/api/projects/{id}` | Get project |
| `DELETE` | `/api/projects/{id}` | Delete project |
| `POST` | `/api/projects/{id}/snapshots` | Push snapshot |
| `GET` | `/api/projects/{id}/snapshots` | List snapshots (`?limit=N`) |
| `GET` | `/api/projects/{id}/snapshots/latest` | Get latest snapshot |
| `GET` | `/api/projects/{id}/snapshots/{snapId}` | Get snapshot by ID |
| `PUT` | `/api/users/me/pubkey` | Register X25519 public key |

---

## 🧪 Testing

```bash
# CLI tests (crypto roundtrips)
cd cli/envsync-cli
cargo test

# Backend unit tests (no database required)
cd backend
./mvnw test

# Frontend type-check + build
cd frontend
npm run build
```

---

<div align="center">
Built to solve a real problem every dev team faces. No cloud required.
</div>
