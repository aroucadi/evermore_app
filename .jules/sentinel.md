## 2024-05-23 - Default-Value Auth Bypass in Cron Jobs
**Vulnerability:** The cron job endpoint checked `authHeader !== 'Bearer ' + process.env.CRON_SECRET`. When `CRON_SECRET` was undefined, this resolved to `"Bearer undefined"`, allowing attackers to bypass authentication by sending that exact header string.
**Learning:** Relying on implicit string concatenation with environment variables can create accidental "fail-open" scenarios where a missing configuration creates a vulnerability rather than an error.
**Prevention:** Always explicitly check if the secret/environment variable exists (`if (!secret)`) before performing the comparison, or ensure the application fails to start if critical secrets are missing.

## 2026-01-31 - IDOR in Preferences API
**Vulnerability:** The `PATCH` and `GET` endpoints at `/api/users/[id]/preferences` blindly accepted the `id` parameter without verifying it against the authenticated user's session.
**Learning:** Middleware authentication (checking validity of session) is not enough for authorization (checking permission to access specific resource). Explicit ownership checks are required in route handlers.
**Prevention:** Always compare `req.headers.get('x-user-id')` (injected by middleware) with the route parameter `id` for user-scoped resources.
