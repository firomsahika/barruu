# Changelog 📜

All notable changes to **Siidaa Barruu** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-21

### Added
- **Real-Time Notification System**:
  - Socket.IO integration with dynamic room allocation per authenticated user.
  - Live push events for article likes, unicorn reactions, comments, and new followers.
  - Interactive unread notification count badge in site header with 30s background sync.
  - Notification management API endpoints (`/unread-count`, `/mark-all-read`, `/:id/read`).
- **Comprehensive Automated Test Suites**:
  - 30 server unit tests covering Zod schemas, auth middleware, reading time calculation, slug collision handling, and notification delivery.
  - 10 client unit tests covering date formatting, relative time calculation, avatar fallback generation, and category taxonomy.
- **Root Monorepo Infrastructure**:
  - Turnkey `package.json` workspace management with unified `npm run build`, `npm run lint`, and `npm test` pipelines.
  - Standalone `.env.example` configurations for root, client, and server.
- **Production CI/CD Pipelines**:
  - GitHub Actions automated continuous integration (`ci.yml`) covering lint, type-check, test, and build.
  - Security audit and vulnerability scanning workflow (`security.yml`).
- **Complete Technical Documentation**:
  - Comprehensive top-level `README.md` with system architecture diagrams.
  - Dedicated `ARCHITECTURE.md` with sequence diagrams and state management blueprints.
  - Dedicated `API.md` with full REST and WebSocket request/response schemas.
  - Security policy (`SECURITY.md`), Contribution guide (`CONTRIBUTING.md`), and MIT License (`LICENSE`).

### Changed
- Refactored `DashboardPage` and `UserProfilePage` to eliminate synchronous state setting in React effects, adhering strictly to React 19 best practices.
- Decoupled Socket.IO server registry in `server/src/lib/socket.ts`, resolving circular dependencies between HTTP entrypoints and domain services.
- Enhanced reading time algorithm to accurately count Afaan Oromo words using calibrated 100 WPM pacing.
- Wrapped Next.js `useSearchParams()` components in Suspense boundaries for optimized Turbopack static prerendering.

---

## [0.9.0] - 2026-09-02

### Added
- Prisma migration `20260902180000_add_follow_notification` adding `FOLLOW` to NotificationType enum.
- Cloudinary media upload integration for cover images and author profile avatars.
- Follow/unfollow author social graph and bookmarking engine.

---

## [0.8.0] - 2026-08-24

### Added
- TipTap rich text editing experience with auto-drafting and markdown syntax support.
- Multidimensional category routing for 8 Afaan Oromo literary genres.
- Dual reaction engine (`LIKE`, `UNICORN`) with optimistic feedback.
