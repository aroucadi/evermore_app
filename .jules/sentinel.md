## 2024-05-23 - Default-Value Auth Bypass in Cron Jobs
**Vulnerability:** The cron job endpoint checked `authHeader !== 'Bearer ' + process.env.CRON_SECRET`. When `CRON_SECRET` was undefined, this resolved to `"Bearer undefined"`, allowing attackers to bypass authentication by sending that exact header string.
**Learning:** Relying on implicit string concatenation with environment variables can create accidental "fail-open" scenarios where a missing configuration creates a vulnerability rather than an error.
**Prevention:** Always explicitly check if the secret/environment variable exists (`if (!secret)`) before performing the comparison, or ensure the application fails to start if critical secrets are missing.

## 2026-01-25 - IDOR in User Preferences
**Vulnerability:** The `/api/users/[id]/preferences` endpoints (PATCH/GET) used `params.id` to fetch/update data without verifying it matched the authenticated user's ID.
**Learning:** Middleware authentication (injecting headers) does not automatically protect resources; route handlers must explicitly validate that the `x-user-id` header matches the requested resource ID.
**Prevention:** Always compare `req.headers.get('x-user-id')` against route parameters (`params.id`) for user-specific resources.
