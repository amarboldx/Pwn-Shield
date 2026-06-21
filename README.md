# 🛡️ PwnShield

> **Zero-Knowledge Cryptographic Security Suite & Credential Shield**

![Java](https://img.shields.io/badge/Java-25%20LTS-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Architecture](https://img.shields.io/badge/Architecture-Monorepo-8A2BE2?style=for-the-badge)

PwnGuard is a modern, client-side-heavy security ecosystem built on a single uncompromising rule: **Your plain-text secrets never touch a network socket.** Starting as an advanced $k$-anonymity vulnerability scanner, PwnGuard is actively expanding into a fully encrypted, self-hostable Zero-Knowledge Password Manager with native OS mobile clients.

---

## 🗺️ Ecosystem Roadmap & Progress Tracker

┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│   PHASE 1: THE SHIELD   │ ───► │   PHASE 2: THE VAULT    │ ───► │   PHASE 3: THE POCKET   │
│  (Vulnerability Engine) │      │ (Zero-Knowledge Manager)│      │  (Native Mobile Clients)│
│       [ COMPLETED ]     │      │     [ IN PROGRESS ]     │      │       [ PLANNED ]       │
└─────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘

### Phase 1: The Vulnerability Engine `[🟢 COMPLETED]`
* [x] **Stateless Security Broker:** Spring Boot 4.1 backend configured with zero session persistence.
* [x] **Client-Side Cryptography Core:** Pure TypeScript WebCrypto SHA-1 engine running in-browser.
* [x] **Live $k$-Anonymity Lookup:** Slices local hashes into 5-character prefixes to guarantee zero-knowledge API querying.
* [x] **Encrypted Vault Importer:** PapaParse-driven local CSV ingestion supporting ProtonPass, Bitwarden, 1Password, and Chrome.
* [x] **Smart-Heuristic Auto-Mapper:** Regex-free column detection with interactive 4-row user override matrix.
* [x] **Anti-Flood Batching Queue:** Throttles concurrent WebCrypto verification checks to protect backend socket pools.
* [x] **Dynamic Shard Branding:** Real-time Favicon resolution via DuckDuckGo open CDN.
* [x] **Anti-Warp Viewport:** CSS-locked multi-column matrix with native hover tooltips and dual scroll controls.

### Phase 2: The Zero-Knowledge Vault `[🟡 IN PROGRESS]`
* [ ] **PostgreSQL Infrastructure:** Schema provisioning for encrypted user blobs and synchronization metadata.
* [ ] **Argon2id Key Derivation:** Client-side stretching of Master Passwords to derive dual `Auth` and `Vault` keys.
* [ ] **AES-256-GCM Cryptography:** Local encryption/decryption of credential payloads before network transit.
* [ ] **Stateless Broker Auth:** Spring Security JWT implementation validated against stretched authentication hashes.
* [ ] **Blob Synchronization Engine:** Delta-sync API endpoints (`/api/v1/vault/sync`) for cloud state resolution.
* [ ] **Vault Dashboard UI:** Secure CRUD interface for adding, generating, and organizing encrypted credentials.

### Phase 3: Native Mobile Clients `[⚪ PLANNED]`
* [ ] **Native Kotlin Android App:** Jetpack Compose UI utilizing the decoupled `core/crypto` logic.
* [ ] **Hardware Keystore Hook:** Hooking local AES vault keys into Android BiometricPrompt (Fingerprint / FaceID).
* [ ] **Android AutoFill Framework:** Deep OS-level integration to inject decrypted vault credentials directly into mobile browsers and third-party apps.
* [ ] **Cross-Platform Audit:** Exploring Kotlin Multiplatform (KMP) / Flutter viability for iOS parity.

---

## 🔒 The Security Math: How Phase 1 Works

When you type a password into PwnGuard, it is never transmitted to our server, nor to HaveIBeenPwned. We utilize **$k$-Anonymity via Range Queries**:

1. You input `CorrectHorseBatteryStaple`.
2. Your browser's hardware accelerates it into a local SHA-1 hash: `C474D9280145828...`
3. Your browser splits the hash and sends **only the first 5 characters** (`C474D`) to our Spring Boot proxy.
4. The backend fetches a raw text list of ~600 known compromised hash suffixes that start with `C474D`.
5. Your browser searches that local text stream for the remaining suffix (`9280145828...`). 

*If it finds a match, your password is compromised. If it doesn't, you are safe. **At no point did the server or the API learn what your password was.***

---

## 📂 Monorepo Architecture

```text
pwnguard/
├── backend/                  # Java 25 / Spring Boot 4.1 Reverse Proxy & API
│   └── src/main/java/com/pwnguard/
│       ├── config/           # Security headers, CORS, RestClient Beans
│       └── pwned/            # Phase 1 Controller & Service layer
│
├── frontend/                 # React / Vite / TypeScript App
│   └── src/
│       ├── core/crypto/      # Vanilla TS cryptography (Framework-agnostic)
│       └── features/         # Feature-isolated React modules
│
└── .gitignore                # Global monorepo artifact exclusion rules


## 🚀 Getting Started (Local Development)

### Prerequisites
* **Java 25 JDK** (Eclipse Temurin recommended)
* **Node.js v20+** & NPM

### 1. Spin up the Backend Broker
```bash
cd backend
./mvnw spring-boot:run
The server will boot inside an embedded Tomcat instance on http://localhost:8080.

###2. Spin up the Client Interface
Open a second terminal sitting in your root directory:

```bash
cd frontend
npm install
npm run dev

Vite will instantly expose the UI at http://localhost:5173.
