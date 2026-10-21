# Contributing to Siidaa Barruu 🤝

Thank you for your interest in contributing to **Siidaa Barruu**! We welcome bug fixes, documentation improvements, feature enhancements, and localization contributions.

---

## Code of Conduct

All contributors and participants are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Development Workflow

### 1. Prerequisites
- Node.js `v18.0.0` or higher
- PostgreSQL `v14.0` or higher
- Git

### 2. Fork and Clone
```bash
git clone https://github.com/your-username/barruu.git
cd barruu
```

### 3. Setup Dependencies
```bash
# Install backend and frontend dependencies
npm --prefix server install
npm --prefix client install
```

### 4. Branching Model
Create a descriptive branch for your work:
```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/issue-description
```

---

## Code Style & Testing Requirements

Before opening a pull request, you must ensure that all quality gates pass:

```bash
# 1. Run all unit and integration tests (Must pass 100%)
npm test

# 2. Run TypeScript compilation and ESLint verification
npm run lint

# 3. Verify production build succeeds
npm run build
```

---

## Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature for the user or API.
- `fix:` A bug fix.
- `docs:` Documentation only changes.
- `style:` Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- `refactor:` A code change that neither fixes a bug nor adds a feature.
- `perf:` A code change that improves performance.
- `test:` Adding missing tests or correcting existing tests.
- `chore:` Changes to the build process or auxiliary tools and libraries.

**Example**:
```bash
git commit -m "feat(notifications): add unread count badge and socket invalidation"
```

---

## Submitting Pull Requests

1. Push your branch to GitHub:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a Pull Request targeting the `main` branch.
3. Fill out the pull request template describing your changes, motivation, and test coverage evidence.
4. Maintainers will review your PR and provide constructive feedback.
