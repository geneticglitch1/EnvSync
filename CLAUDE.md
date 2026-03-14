# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EnvSync is a self-hosted, zero-knowledge encrypted environment variable management system — think git for `.env` files. It consists of three components:

- **Backend** — Spring Boot 3 REST API (Java 21)
- **Frontend** — Next.js 15 web dashboard (TypeScript)
- **CLI** — Rust-based command-line tool (`cli/envsync-cli/`)

## Development Infrastructure

All dependent services run via Docker Compose:

```bash
docker compose up -d    # PostgreSQL 15, Redis 7, MinIO, Keycloak (port 8180), pgAdmin (port 5050)
docker compose down
```

## Commands

### Backend (Spring Boot + Maven)
```bash
cd backend
./mvnw spring-boot:run      # Dev server on port 8081
./mvnw test                  # Run tests
./mvnw clean package         # Build JAR
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev     # Dev server on port 3000
npm run build
npm run lint
```

Copy `frontend/.env.example` to `frontend/.env.local` and fill in Keycloak credentials before running.

### CLI (Rust)
```bash
cd cli/envsync-cli
cargo build             # Debug build
cargo build --release   # Release build
cargo test              # Run tests
cargo clippy            # Lint
cargo fmt               # Format
```

## Architecture

### Request Flow
```
CLI / Browser
    → NGINX (TLS termination)
    → Spring Boot API (port 8081)
        → PostgreSQL (vaults, audit logs)
        → Redis (pub/sub for real-time notifications)
        → MinIO (encrypted vault snapshots, S3-compatible)
    → Keycloak (OIDC/JWT validation, port 8180)
```

### Authentication
- **CLI** uses OAuth2 device code flow against Keycloak (`cli/envsync-cli/src/api/auth.rs`)
- **Frontend** uses NextAuth with Keycloak OIDC provider (`frontend/src/lib/auth.ts`)
- **Backend** is a Spring Security OAuth2 resource server — validates JWTs from Keycloak (`backend/src/main/java/.../SecurityConfig.java`)
- Keycloak realm: `envsync`

### Zero-Knowledge Encryption (CLI)
All encryption is client-side before data reaches the server:
- Key derivation: Argon2id
- Encryption: XChaCha20-Poly1305 (via `sodiumoxide`/libsodium)
- Team sharing: vault key wrapped per-member with asymmetric encryption
- Server only stores ciphertext

### CLI Commands
Implemented in `cli/envsync-cli/src/commands/`: `init`, `push`, `pull`, `diff`, `log`, `set`, `unset`, `rollback`

### Backend Config
Key settings in `backend/src/main/resources/application.properties`:
- PostgreSQL: `localhost:5432` (user/pass: `admin`/`admin`)
- Redis: `localhost:6379`
- MinIO: `http://localhost:9000` (user/pass: `minioadmin`/`minioadmin`)
- Keycloak JWKS: `http://localhost:8180/realms/envsync`
