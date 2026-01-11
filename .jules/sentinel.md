## 2024-05-23 - Default-Value Auth Bypass in Cron Jobs
**Vulnerability:** The cron job endpoint checked `authHeader !== 'Bearer ' + process.env.CRON_SECRET`. When `CRON_SECRET` was undefined, this resolved to `"Bearer undefined"`, allowing attackers to bypass authentication by sending that exact header string.
**Learning:** Relying on implicit string concatenation with environment variables can create accidental "fail-open" scenarios where a missing configuration creates a vulnerability rather than an error.
**Prevention:** Always explicitly check if the secret/environment variable exists (`if (!secret)`) before performing the comparison, or ensure the application fails to start if critical secrets are missing.

## 2026-01-11 - Timing Attack & Error Leakage in Cron Jobs
**Vulnerability:** The cron job endpoint used insecure string comparison (`authHeader !== 'Bearer ' + secret`) and leaked raw error messages in 500 responses.
**Learning:** Simple string comparisons for authentication tokens are vulnerable to timing attacks. Leaking error messages in background jobs can expose internal state.
**Prevention:** Use `crypto.timingSafeEqual` for constant-time comparison of secrets. Always catch exceptions in API routes and return generic error messages to the client, while logging details server-side.
