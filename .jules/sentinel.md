## 2024-05-23 - Default-Value Auth Bypass in Cron Jobs
**Vulnerability:** The cron job endpoint checked `authHeader !== 'Bearer ' + process.env.CRON_SECRET`. When `CRON_SECRET` was undefined, this resolved to `"Bearer undefined"`, allowing attackers to bypass authentication by sending that exact header string.
**Learning:** Relying on implicit string concatenation with environment variables can create accidental "fail-open" scenarios where a missing configuration creates a vulnerability rather than an error.
**Prevention:** Always explicitly check if the secret/environment variable exists (`if (!secret)`) before performing the comparison, or ensure the application fails to start if critical secrets are missing.

## 2026-01-30 - Cron Job Timing Attack & Error Leakage
**Vulnerability:** The cron job endpoint used simple string comparison for auth (vulnerable to timing attacks) and returned raw error messages (leaking internals).
**Learning:** Even internal endpoints need constant-time comparison for secrets and generic error messages to prevent information leakage.
**Prevention:** Use `crypto.timingSafeEqual` for all secret comparisons and wrap route handlers in try/catch blocks that return generic 500 errors.
