# Siidaa Barruu 📚

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16%2B-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express-5.x-lightgrey?logo=express&logoColor=black)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Tests](https://img.shields.io/badge/Tests-40%20Passing-brightgreen?logo=node.js&logoColor=white)](#testing--quality-assurance)
[![Code Quality](https://img.shields.io/badge/Code%20Quality-A%2B-success)](#architecture--design-patterns)

> **Siidaa Barruu** is a modern, high-performance digital publishing and creative writing platform engineered for Afaan Oromo literature, poetry, folklore, cultural narratives, and audio-assisted storytelling. Inspired by developer communities like DEV.to and Medium, it couples an expressive, distraction-free reading and authoring experience with a production-grade decoupled architecture.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Monorepo Directory Structure](#-monorepo-directory-structure)
- [Data Flow & Lifecycle](#-data-flow--lifecycle)
- [Database Schema & Entity Relationships](#-database-schema--entity-relationships)
- [API Reference](#-api-reference)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Environment Configuration](#-environment-configuration)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Security & Compliance](#-security--compliance)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Key Features

### 🖋️ Rich Content Authoring
- **Interactive WYSIWYG Editor**: Built with TipTap (headless ProseMirror framework) supporting markdown shortcuts, rich embeds, blockquotes, headers, ordered/unordered lists, code snippets, and image/audio attachments.
- **Draft & Versioning Flow**: Continuous draft persistence, manual/automatic saving, and instant one-click publishing.
- **Automated Metadata Computation**: Dynamic reading time estimation calibrated for Afaan Oromo word cadence (100 WPM) and automatic excerpt extraction with HTML sanitization.
- **Multi-Media Asset Management**: Direct, secured image upload pipeline integrated with Cloudinary for responsive banner images and avatars.

### 📚 Multidimensional Taxonomy & Discovery
- **Eight Specialized Literary Categories**: 
  - `ODUU` (News & Reports)
  - `MAMMAAKSA` (Proverbs & Wisdom)
  - `SEENAA` (History & Heritage)
  - `WALALOO` (Poetry & Rhyme)
  - `DURDURII` (Fables & Folk Tales)
  - `ASOOSAMA` (Novels & Fiction)
  - `OOLMAA` (Daily Life & Essays)
  - `SAGALEE` (Audio Stories & Spoken Word)
- **Tag Cloud & Indexing**: Automatic tag slugification, upserting, article indexing, and filtered multi-tag discovery.
- **Full-Text Multi-Field Search**: Real-time search across titles, excerpts, and author names.

### 💬 Community Engagement & Social Graph
- **Dual-Reaction Engine**: Multi-tier reaction system supporting standard `LIKE` and expressiveness `UNICORN` signals with immediate optimistic UI updates.
- **Threaded Commenting**: Contextual comment trees on published literature with author attribution.
- **Social Graph & Following**: Follow/unfollow author network enabling readers to curate their literary feeds.
- **Personal Library & Bookmarks**: Private bookmarking engine (`Kitaaboo Koo`) allowing users to save and curate reading lists.

### ⚡ Real-Time Notification Engine
- **WebSocket Streaming**: Powered by Socket.IO with isolated client user-room multiplexing (`socket.join(userId)`).
- **Multi-Event Notifications**: Instant real-time alerts when other users like, unicorn, comment on articles, or follow user profiles.
- **Unread Aggregations**: Efficient polling fallback (30s) and instant WebSocket-driven cache invalidation.

---

## 🏗 System Architecture

Siidaa Barruu implements a clean, decoupled monorepo architecture with separation of concerns:

```mermaid
graph TD
    subgraph Client ["Client (Next.js 16+ App Router)"]
        UI[Tailwind CSS & Lucide Icons]
        State[Zustand Auth Store]
        Cache[TanStack React Query]
        Editor[TipTap WYSIWYG Editor]
        SocketClient[Socket.IO Client]
    end

    subgraph Server ["Server (Node.js & Express 5.x)"]
        Router[REST API Router]
        Auth[JWT & Bcrypt Guard]
        Validation[Zod Validation Schemas]
        Services[Business Logic Services]
        SocketServer[Socket.IO Server]
        ORM[Prisma ORM Client]
    end

    subgraph Storage ["Persistent Data Layer"]
        DB[(PostgreSQL Database)]
        Cloud[Cloudinary CDN Media]
    end

    Client -->|HTTPS REST API| Router
    Client <-->|WSS WebSockets| SocketServer
    Router --> Auth
    Auth --> Validation
    Validation --> Services
    Services --> ORM
    Services --> Cloud
    Services -->|Broadcast Events| SocketServer
    ORM <--> DB
```

---

## 💻 Tech Stack

### Frontend Architecture
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | `16.3.0` | React App Router framework with hybrid SSR/CSR and Turbo bundling |
| **React** | `19.2.8` | Declarative UI runtime with modern hooks and suspense boundaries |
| **TypeScript** | `5.x` | Strict type safety across components, hooks, and API contracts |
| **Tailwind CSS** | `4.x` | Utility-first design tokens with sleek, accessible typography |
| **TanStack React Query**| `5.x` | Asynchronous cache management, optimistic updates, and invalidations |
| **Zustand** | `5.x` | Lightweight reactive global auth state with localStorage sync |
| **TipTap Editor** | `3.x` | Headless extensible ProseMirror rich-text writing canvas |
| **Socket.IO Client** | `4.8.x` | Bi-directional WebSocket communication for live notifications |
| **Lucide React** | `1.33.x` | Consistent, accessible icon set |

### Backend Architecture
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `26.x` | Scalable JavaScript runtime environment |
| **Express.js** | `5.2.x` | Robust RESTful HTTP routing, middleware pipeline, and error handling |
| **Prisma ORM** | `6.19.x` | Type-safe schema definition, automated migrations, and SQL queries |
| **PostgreSQL** | `16+` | Relational ACID-compliant database with foreign key integrity |
| **Zod** | `4.x` | Declarative runtime input schema validation and sanitization |
| **Socket.IO** | `4.8.x` | WebSocket multiplexing for instant user room event emissions |
| **JWT & BcryptJS** | Latest | Secure stateless authentication and salted SHA-512 password hashing |
| **Cloudinary SDK** | `2.x` | Cloud media asset pipeline with automatic transformation |
| **Tsx / Node Test** | Native | Zero-dependency TypeScript compilation and high-speed test runner |

---

## 📂 Monorepo Directory Structure

```text
barruu/
├── .github/                      # CI/CD pipelines, issue & PR templates
│   ├── workflows/
│   │   ├── ci.yml                # Automated linting, type-checking, tests, and builds
│   │   └── security.yml          # Static analysis, dependency audits, and security scan
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
├── client/                       # Next.js 16 frontend application
│   ├── src/
│   │   ├── app/                  # App Router pages and dynamic routes
│   │   │   ├── [category]/       # Filtered category feed
│   │   │   ├── article/[slug]/   # Article detail reading view with comments
│   │   │   ├── dashboard/        # Author dashboard & profile management
│   │   │   ├── notifications/    # Notifications center
│   │   │   ├── tag/[slug]/       # Tag-filtered article listings
│   │   │   ├── user/[username]/  # Public author profiles
│   │   │   └── write/            # TipTap publishing canvas
│   │   ├── components/           # Modular reusable React components
│   │   ├── hooks/                # React Query data fetching & mutation hooks
│   │   ├── lib/                  # Axios HTTP client, image uploaders
│   │   ├── store/                # Zustand global authentication store
│   │   ├── types/                # Global TypeScript contracts & formatters
│   │   └── __tests__/            # Frontend utility & unit test suites
│   ├── package.json
│   └── tsconfig.json
├── server/                       # Express.js REST API & WebSocket server
│   ├── prisma/
│   │   ├── schema.prisma         # Data models, relations, and enums
│   │   └── migrations/           # Version-controlled database migrations
│   ├── src/
│   │   ├── controllers/          # HTTP request handlers & response formatting
│   │   ├── middleware/           # Auth guards, security headers, role checks
│   │   ├── routes/               # Modular Express endpoint definitions
│   │   ├── services/             # Core business logic & database interactions
│   │   ├── validations/          # Zod request payload validation schemas
│   │   ├── lib/                  # Prisma singleton & Socket.IO registry
│   │   ├── __tests__/            # Server unit, validation, and middleware tests
│   │   └── index.ts              # Server entry point & socket initialization
│   ├── package.json
│   └── tsconfig.json
├── docs/                         # Extended technical documentation
│   ├── ARCHITECTURE.md           # System design, data flows, and design patterns
│   └── API.md                    # Comprehensive REST & WebSocket API specification
├── .env.example                  # Monorepo environment variable template
├── CHANGELOG.md                  # Release version history
├── CONTRIBUTING.md               # Contribution standards and PR guidelines
├── CODE_OF_CONDUCT.md           # Contributor covenant
├── LICENSE                       # MIT Open Source License
└── package.json                  # Root monorepo workspace configuration
```

---

## 🔄 Data Flow & Lifecycle

### Publishing an Article
```mermaid
sequenceDiagram
    autonumber
    actor Writer as Author
    participant Web as Next.js Client
    participant API as Express Server
    participant Auth as Auth Middleware
    participant Val as Zod Validator
    participant Svc as Article Service
    participant DB as PostgreSQL (Prisma)
    participant Socket as Socket.IO Hub

    Writer->>Web: Compose text in TipTap & click "Publish"
    Web->>API: POST /api/articles (Bearer Token, Payload)
    API->>Auth: Verify JWT Token
    Auth-->>API: Valid user (Attach user.id)
    API->>Val: Validate against createArticleSchema
    Val-->>API: Validated payload
    API->>Svc: Call createArticle(payload, userId)
    Svc->>Svc: Slugify title, resolve unique collisions
    Svc->>Svc: Calculate reading time (100 WPM)
    Svc->>DB: Upsert tags & create Article record
    DB-->>Svc: Persisted Article record
    Svc-->>API: Return article JSON response
    API-->>Web: HTTP 201 Created (Redirect to /article/[slug])
    Web->>Socket: Emit real-time notification to followers (if configured)
```

---

## 🗄 Database Schema & Entity Relationships

The relational data layer is strictly modeled using Prisma ORM:

```mermaid
erDiagram
    USER ||--o{ ARTICLE : authors
    USER ||--o{ COMMENT : writes
    USER ||--o{ REACTION : submits
    USER ||--o{ BOOKMARK : saves
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ FOLLOW : "follows / followedBy"

    ARTICLE ||--o{ ARTICLE_TAG : categorizes
    TAG ||--o{ ARTICLE_TAG : tags
    ARTICLE ||--o{ COMMENT : receives
    ARTICLE ||--o{ REACTION : contains
    ARTICLE ||--o{ BOOKMARK : storedIn

    USER {
        string id PK
        string email UK
        string username UK
        string name
        string password
        string avatarUrl
        string bio
        Role role
        datetime createdAt
    }

    ARTICLE {
        string id PK
        string slug UK
        string title
        string content
        string excerpt
        string coverImageUrl
        string audioUrl
        Category category
        int readingTime
        boolean published
        boolean featured
        int viewCount
        datetime createdAt
    }

    COMMENT {
        string id PK
        string content
        string articleId FK
        string authorId FK
        string parentId FK
        datetime createdAt
    }

    NOTIFICATION {
        string id PK
        string userId FK
        string actorId FK
        NotificationType type
        string message
        string link
        boolean isRead
        datetime createdAt
    }
```

---

## 📡 API Reference

For detailed endpoint payloads, query parameters, status codes, and error representations, refer to [docs/API.md](docs/API.md).

### Endpoint Summary
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new author account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | **Yes** |
| `POST` | `/api/auth/forgot-password` | Request password reset token | No |
| `POST` | `/api/auth/reset-password` | Set new password with valid token | No |
| `GET` | `/api/articles` | Query paginated published articles (supports filters) | Optional |
| `GET` | `/api/articles/:slug` | Get full article details by URL slug | Optional |
| `POST` | `/api/articles` | Publish new article | **Yes** |
| `PUT` | `/api/articles/:id` | Update existing article draft/content | **Yes** |
| `DELETE`| `/api/articles/:id` | Delete author's article | **Yes** |
| `POST` | `/api/articles/:id/react` | Toggle reaction (`LIKE`, `UNICORN`) | **Yes** |
| `POST` | `/api/articles/:id/bookmark` | Toggle article bookmark | **Yes** |
| `POST` | `/api/articles/:id/comments` | Add comment to article | **Yes** |
| `GET` | `/api/tags` | List all tags with article counts | No |
| `GET` | `/api/users/:username` | View author profile, stats, and articles | Optional |
| `POST` | `/api/users/follow` | Follow author | **Yes** |
| `POST` | `/api/users/unfollow` | Unfollow author | **Yes** |
| `GET` | `/api/notifications` | Get latest 20 notifications | **Yes** |
| `GET` | `/api/notifications/unread-count` | Get count of unread notifications | **Yes** |
| `PATCH`| `/api/notifications/mark-all-read` | Mark all notifications as read | **Yes** |
| `POST` | `/api/uploads/image` | Upload image to Cloudinary storage | **Yes** |
| `GET` | `/api/health` | Health check endpoint | No |

---

## 🚀 Getting Started & Local Setup

### Option A: Quickstart with Docker Compose (Recommended)
You can launch the entire stack (PostgreSQL database, Express API server, and Next.js frontend) with a single command:

```bash
docker compose up --build
```
- **Client Application**: [http://localhost:3000](http://localhost:3000)
- **API Server & Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **PostgreSQL Database**: `localhost:5432`

---

### Option B: Manual Host Setup

#### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ or v22+ recommended)
- **npm**: v9.0.0 or later
- **PostgreSQL**: v14.0 or later (or cloud PostgreSQL such as Neon, Supabase)

#### 1. Clone the Repository
```bash
git clone https://github.com/firomsahika/barruu.git
cd barruu
```

#### 2. Environment Variables Setup
Copy the environment template files:
```bash
# Server environment
cp server/.env.example server/.env

# Client environment
cp client/.env.example client/.env.local
```
Update `DATABASE_URL` and `JWT_SECRET` in `server/.env`.

#### 3. Install Dependencies
```bash
# Install server dependencies
npm --prefix server install

# Install client dependencies
npm --prefix client install
```

> [!IMPORTANT]
> **Deterministic Installs & Monorepo Lockfile Discipline**:
> Both `server/package-lock.json` and `client/package-lock.json` are committed to version control to guarantee reproducible, zero-drift builds across developer machines and CI/CD pipelines. Whenever dependencies are updated or added, both workspace lockfiles must be updated and committed together.


#### 4. Database Migration & Schema Generation
```bash
# Generate Prisma Client
npm run prisma:generate

# Apply database migrations
npm run prisma:migrate
```

#### 5. Run Development Servers
Start both servers concurrently:
```bash
# Terminal 1: Backend API (runs on port 5000)
npm run dev:server

# Terminal 2: Next.js Client (runs on port 3000)
npm run dev:client
```
Visit `http://localhost:3000` in your browser.

---

## ⚙️ Environment Configuration

### Server (`server/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | API server port | `5000` |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/barruu` |
| `JWT_SECRET` | Secret key used for signing and verifying JWT tokens | `your_secure_random_jwt_secret` |
| `CLIENT_URL` | Allowed CORS origins (comma-separated for multiples) | `http://localhost:3000` |
| `LOG_LEVEL` | Pino logging level (`debug`, `info`, `warn`, `error`) | `info` |
| `PASSWORD_RESET_WEBHOOK_URL` | Optional outbound webhook endpoint for password reset links | `https://example.com/api/webhooks/reset` |
| `PASSWORD_RESET_WEBHOOK_SECRET` | Bearer token / secret for authenticating password reset webhooks | `your_secure_webhook_secret` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary storage cloud identifier | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your_api_secret` |

### Client (`client/.env.local`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base HTTP URL for server REST API endpoints | `http://localhost:5000/api` |

---

## 🧪 Testing & Quality Assurance

Siidaa Barruu includes comprehensive automated test suites covering input validations, domain business rules, auth middleware guards, centralized error handling, structured logging, and frontend utility functions.

### Run All Tests
```bash
# Run entire test suite across client and server
npm test
```

### Run Server Tests
```bash
npm --prefix server test
```

### Run Server Test Coverage Check (Enforced Threshold)
```bash
# Executes c8 coverage runner and enforces a minimum 70% line coverage threshold
npm --prefix server run test:coverage
```
*Continuous integration (CI) automatically checks this threshold on every pull request and push to main, failing the build if coverage regresses below 70%.*

### Run Client Tests
```bash
npm --prefix client test
```

### Run Linting & Code Quality
```bash
# Verify both TypeScript compilation and ESLint compliance (zero warnings)
npm run lint
```

---

## 🛡 Security & Compliance

- **No Plaintext Passwords**: Uses salted Bcrypt hashing (`cost = 10`).
- **Strict Payload & Query Validation**: All incoming requests and query parameters are validated against Zod schemas, stripping unrecognized properties and preventing injection vectors.
- **Structured JSON Logging**: Centralized logger (`server/src/lib/logger.ts`) emitting structured NDJSON with contextual request metadata, sanitized error traces, and runtime `LOG_LEVEL` filtering.
- **Enterprise Secret Manager Integration**: Production deployments support automated credential injection from AWS Secrets Manager, HashiCorp Vault, or Doppler. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#7-enterprise-secret-manager-integration) for architecture patterns and bootstrapping examples.
- **OWASP Secure HTTP Headers**: Express headers include `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
- **Stateless Bearer JWTs**: Fast, distributed cryptographic authorization with granular role-based access control (`USER`, `ADMIN`).
- **Safe HTML Rendering**: Frontend sanitizes and controls rich text rendering to prevent XSS.
- **Secret Isolation**: All credentials, tokens, and storage keys are managed strictly via environment variables and excluded from version control.


---

## 🤝 Contributing

Contributions are welcomed! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before submitting pull requests.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Run tests and linting (`npm test && npm run lint`)
4. Commit your Changes (`git commit -m 'feat: add amazing feature'`)
5. Push to the Branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

© 2026 **Siidaa Barruu** — Developed with passion by [Firomsa Hika](https://github.com/firomsahika).
