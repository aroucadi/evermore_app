## 2024-05-23 - Default-Value Auth Bypass in Cron Jobs
**Vulnerability:** The cron job endpoint checked `authHeader !== 'Bearer ' + process.env.CRON_SECRET`. When `CRON_SECRET` was undefined, this resolved to `"Bearer undefined"`, allowing attackers to bypass authentication by sending that exact header string.
**Learning:** Relying on implicit string concatenation with environment variables can create accidental "fail-open" scenarios where a missing configuration creates a vulnerability rather than an error.
**Prevention:** Always explicitly check if the secret/environment variable exists (`if (!secret)`) before performing the comparison, or ensure the application fails to start if critical secrets are missing.

## 2026-02-03 - Implicit Authorization Bypass in Service Layer
**Vulnerability:** The `UserProfileUpdater` service blindly trusted the ID passed to it, and the `PATCH /api/users/[id]/preferences` endpoint failed to verify that the `x-user-id` header matched the route parameter `id`.
**Learning:** Service layer components often assume authorization is handled upstream. If the API layer also assumes the Service layer handles it (or just forgets), a "gap" is created where no one checks permissions.
**Prevention:** Enforce authorization at the API entry point (Controller/Route Handler) by explicitly validating that the authenticated user (`x-user-id`) has permission to access the requested resource (`params.id`).
