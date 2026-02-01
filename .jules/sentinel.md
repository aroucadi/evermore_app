## 2024-05-23 - Default-Value Auth Bypass in Cron Jobs
**Vulnerability:** The cron job endpoint checked `authHeader !== 'Bearer ' + process.env.CRON_SECRET`. When `CRON_SECRET` was undefined, this resolved to `"Bearer undefined"`, allowing attackers to bypass authentication by sending that exact header string.
**Learning:** Relying on implicit string concatenation with environment variables can create accidental "fail-open" scenarios where a missing configuration creates a vulnerability rather than an error.
**Prevention:** Always explicitly check if the secret/environment variable exists (`if (!secret)`) before performing the comparison, or ensure the application fails to start if critical secrets are missing.

## 2026-02-01 - IDOR in User Preferences
**Vulnerability:** The `PATCH` and `GET` endpoints at `/api/users/[id]/preferences` blindly trusted the `id` route parameter without verifying it against the authenticated user's ID (`x-user-id` header). This allowed any authenticated user to view or modify any other user's preferences.
**Learning:** Middleware (like `proxy.ts`) authentication checks do not inherently provide authorization for specific resources. Trusting route parameters without cross-referencing auth context is a common regression.
**Prevention:** Always verify that `req.headers.get('x-user-id')` matches the target resource ID (e.g., `params.id`) for user-specific endpoints.
