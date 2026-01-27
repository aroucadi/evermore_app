## 2024-05-23 - Default-Value Auth Bypass in Cron Jobs
**Vulnerability:** The cron job endpoint checked `authHeader !== 'Bearer ' + process.env.CRON_SECRET`. When `CRON_SECRET` was undefined, this resolved to `"Bearer undefined"`, allowing attackers to bypass authentication by sending that exact header string.
**Learning:** Relying on implicit string concatenation with environment variables can create accidental "fail-open" scenarios where a missing configuration creates a vulnerability rather than an error.
**Prevention:** Always explicitly check if the secret/environment variable exists (`if (!secret)`) before performing the comparison, or ensure the application fails to start if critical secrets are missing.

## 2026-01-27 - IDOR in User Preferences
**Vulnerability:** The `/api/users/[id]/preferences` endpoint used the `id` from the URL parameters to fetch/update data without verifying it matched the authenticated `x-user-id` header.
**Learning:** Middleware authentication (verifying *who* you are) does not automatically imply authorization (verifying *what* you can access). Route handlers must explicitly check ownership.
**Prevention:** Always compare `req.headers.get('x-user-id')` against route parameters in every user-specific endpoint.
