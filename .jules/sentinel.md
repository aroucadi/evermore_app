## 2024-05-23 - Default-Value Auth Bypass in Cron Jobs
**Vulnerability:** The cron job endpoint checked `authHeader !== 'Bearer ' + process.env.CRON_SECRET`. When `CRON_SECRET` was undefined, this resolved to `"Bearer undefined"`, allowing attackers to bypass authentication by sending that exact header string.
**Learning:** Relying on implicit string concatenation with environment variables can create accidental "fail-open" scenarios where a missing configuration creates a vulnerability rather than an error.
**Prevention:** Always explicitly check if the secret/environment variable exists (`if (!secret)`) before performing the comparison, or ensure the application fails to start if critical secrets are missing.

## 2024-05-26 - IDOR in Chapter Access
**Vulnerability:** The `GET /api/chapters/[userId]` endpoint relied solely on the `userId` in the URL to fetch chapters, without verifying if the authenticated user (`x-user-id`) matched the requested `userId`.
**Learning:** Middleware authentication (checking *who* the user is) is insufficient for authorization (checking *what* they can see). Every endpoint taking an ID parameter must explicitly verify ownership or permission against the authenticated context.
**Prevention:** Implement a strict equality check (`authenticatedUserId === targetId`) at the start of any endpoint handler that accepts an entity ID, or use a centralized authorization service for complex relationships.
