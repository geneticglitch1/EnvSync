<div align="center">

# 🔐 EnvSync
## 🚧 Under Development

### Encrypted `.env` Collaboration — Git for your secrets.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)](https://redis.io/)
[![MinIO](https://img.shields.io/badge/MinIO-Object_Storage-C72E49?style=flat-square&logo=minio)](https://min.io/)
[![Keycloak](https://img.shields.io/badge/Keycloak-IAM-4D9B9B?style=flat-square)](https://www.keycloak.org/)
[![NGINX](https://img.shields.io/badge/NGINX-Reverse_Proxy-009639?style=flat-square&logo=nginx)](https://nginx.org/)
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
- **End-to-end encryption** — secrets encrypted client-side with `libsodium` before ever hitting the server
- **Real-time notifications** — teammates get notified instantly via Redis pub/sub when variables change
- **Environment scoping** — separate vaults for `development`, `staging`, `production`
- **Audit log** — full history of who changed what, when, and from where
- **`.env` diff viewer** — visual diff in the web dashboard showing exactly what changed between versions
- **Org & project management** — multi-team support with role-based access control (Admin, Editor, Viewer)
- **MinIO backups** — encrypted vault snapshots stored in self-hosted S3-compatible object storage
- **Keycloak SSO** — enterprise-grade identity: OIDC login, MFA, LDAP, team provisioning

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLI Tool                         │
│              envsync push / pull / diff                 │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS (via NGINX)
                         │ E2E Encrypted Payload
┌────────────────────────▼────────────────────────────────┐
│                     NGINX                               │
│              Reverse Proxy / TLS termination            │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  Spring Boot API                        │
│         Auth · Vault CRUD · Audit Logging               │
└──────┬──────────────────┬──────────────────┬────────────┘
       │                  │                  │
┌──────▼──────┐   ┌───────▼──────┐   ┌──────▼──────┐
│  PostgreSQL │   │    Redis     │   │    MinIO    │
│  Vaults &   │   │  Pub/Sub     │   │   Encrypted │
│  Audit Logs │   │  Notifications│  │   Backups   │
└─────────────┘   └──────────────┘   └─────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Keycloak                             │
│       SSO · OIDC · Role Management · User Provisioning  │
└─────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  Next.js Dashboard                      │
│        Web UI · Real-time updates · Diff viewer         │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Self-Hosted Replaces |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) | — |
| **Backend** | Spring Boot 3 (Java) | — |
| **Database** | PostgreSQL 16 | AWS RDS |
| **Cache / Pub-Sub** | Redis 7 | AWS ElastiCache / SQS |
| **Object Storage** | MinIO | AWS S3 |
| **Identity / Auth** | Keycloak (OIDC) | AWS IAM / Cognito |
| **Reverse Proxy** | NGINX | AWS CloudFront |
| **Encryption** | libsodium / TweetNaCl.js | AWS KMS |
| **ORM** | Hibernate / Spring Data JPA | — |
| **CLI** | Node.js (npm package) | — |
| **Containerization** | Docker Compose | AWS ECS / Fargate |

---

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Java 21+
- Node.js 20+

### 1. Clone & Start Infrastructure

```bash
git clone https://github.com/yourusername/envsync.git
cd envsync
docker compose up -d
# Starts: PostgreSQL, Redis, MinIO, Keycloak, NGINX
```

### 2. Configure Keycloak

```
Open http://localhost:8180
Admin console → Create realm: "envsync"
Create client: "envsync-api"
Set redirect URIs: http://localhost:3000/*
```

### 3. Configure MinIO

```
Open http://localhost:9001 (MinIO Console)
Create bucket: "envsync-backups"
Generate access key → paste into backend .env
```

### 4. Start the Backend

```bash
cd backend
cp .env.example .env   # fill in Keycloak + MinIO credentials
./mvnw spring-boot:run
# API at http://localhost:8080
```

### 5. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# Dashboard at http://localhost:3000
```

### 6. Install the CLI

```bash
npm install -g envsync-cli

envsync login              # OIDC flow via Keycloak
envsync init               # initialize in your project
envsync push               # push your .env to the vault
envsync pull               # pull latest secrets
envsync diff               # see what changed
```

---

## 📖 CLI Reference

```bash
envsync init --project my-app --env development
envsync push                          # push local .env → vault
envsync pull                          # pull vault → local .env
envsync diff                          # diff local vs vault
envsync log                           # view audit log
envsync set DATABASE_URL "postgres://..."
envsync unset OLD_API_KEY
envsync envs                          # list environments (dev/staging/prod)
envsync history                       # version history of the vault
envsync rollback --version 12         # restore a previous vault version
```

---

## 📁 Project Structure

```
envsync/
├── frontend/               # Next.js 15 dashboard
│   ├── app/
│   │   ├── (auth)/         # Keycloak OIDC login flow
│   │   ├── dashboard/      # Overview & notifications
│   │   ├── projects/       # Project vault management
│   │   └── audit/          # Audit log viewer
│   └── components/
│       ├── DiffViewer/     # .env diff component
│       └── VaultEditor/    # Secret CRUD UI
│
├── backend/                # Spring Boot API
│   └── src/main/java/
│       ├── auth/           # Keycloak + Spring Security OIDC
│       ├── vault/          # Vault CRUD & versioning
│       ├── audit/          # Audit log service
│       ├── notification/   # Redis pub/sub notifications
│       └── storage/        # MinIO backup service
│
├── cli/                    # Node.js CLI tool
│   └── src/
│       ├── commands/       # push, pull, diff, set, unset, rollback
│       └── crypto/         # libsodium client-side encryption
│
├── nginx/
│   └── nginx.conf          # Reverse proxy + TLS config
│
└── docker-compose.yml      # Full self-hosted stack
```

---

## 🔒 Security Model

EnvSync uses a **zero-knowledge encryption** model:

1. Secret key derived locally from your password using **Argon2**
2. Secrets encrypted **before** leaving your machine using **XChaCha20-Poly1305**
3. Server only ever stores ciphertext — it physically cannot read your secrets
4. Team sharing via asymmetric encryption — each member's public key wraps the vault key
5. Identity via **Keycloak** — supports MFA, LDAP federation, and social login out of the box

---

<div align="center">
Built to solve a real problem every dev team faces. No cloud required.
</div>
