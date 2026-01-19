## 2024-05-23 - Default-Value Auth Bypass in Cron Jobs
**Vulnerability:** The cron job endpoint checked `authHeader !== 'Bearer ' + process.env.CRON_SECRET`. When `CRON_SECRET` was undefined, this resolved to `"Bearer undefined"`, allowing attackers to bypass authentication by sending that exact header string.
**Learning:** Relying on implicit string concatenation with environment variables can create accidental "fail-open" scenarios where a missing configuration creates a vulnerability rather than an error.
**Prevention:** Always explicitly check if the secret/environment variable exists (`if (!secret)`) before performing the comparison, or ensure the application fails to start if critical secrets are missing.

## 2026-01-19 - Missing IDOR Protection in User Preferences
**Vulnerability:** The `PATCH` and `GET` endpoints at `/api/users/[id]/preferences` relied solely on authentication middleware but failed to verify that the `x-user-id` header matched the route parameter `id`. This allowed any authenticated user to modify or view another user's preferences.
**Learning:** Middleware authentication does not imply authorization. A "fail-closed" middleware only ensures *someone* is logged in, not that they are *allowed* to access the specific resource.
**Prevention:** Always enforce explicit ownership checks (e.g., `if (authUserId !== resourceId)`) in route handlers that access user-specific data, even if authentication middleware is present.
