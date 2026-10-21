# Security Policy 🔒

## Supported Versions

We provide security updates and patches for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

The Siidaa Barruu team takes the security of our platform, user data, and authors seriously. If you discover a security vulnerability, we appreciate your help in disclosing it responsibly.

### How to Report
Please do **NOT** report security vulnerabilities via public GitHub issues, discussions, or social media.

Instead, report vulnerabilities privately by emailing:
- **Security Contact**: `security@barruu.org` or `firomsahika@gmail.com`

### What to Include in Your Report
To help us triage and resolve the issue quickly, please include:
1. Type and description of the vulnerability.
2. Step-by-step instructions or proof-of-concept (PoC) to reproduce the vulnerability.
3. Affected components (e.g. Express endpoint, Prisma model, Client routing, WebSocket connection).
4. Potential impact and severity assessment.

### Our Commitment
- We will acknowledge receipt of your vulnerability report within **48 hours**.
- We will provide a status update and estimated resolution timeframe.
- We will notify you once the fix has been applied and validated.
- Responsible reporters will be credited in our release changelogs (unless you prefer anonymity).

---

## Security Practices in Barruu

1. **Stateless JWT Authorization**: Bearer tokens are digitally signed with strong cryptographic algorithms (`HS256`).
2. **Password Hashing**: Passwords are never stored in plaintext; salted Bcrypt (`10 rounds`) is enforced.
3. **Strict Validation**: All input boundaries are safeguarded with Zod schema verification before execution.
4. **Isolated Secrets**: Keys and connection strings are managed via isolated environment configurations.
