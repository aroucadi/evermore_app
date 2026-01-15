## 2024-05-23 - Default-Value Auth Bypass in Cron Jobs
**Vulnerability:** The cron job endpoint checked `authHeader !== 'Bearer ' + process.env.CRON_SECRET`. When `CRON_SECRET` was undefined, this resolved to `"Bearer undefined"`, allowing attackers to bypass authentication by sending that exact header string.
**Learning:** Relying on implicit string concatenation with environment variables can create accidental "fail-open" scenarios where a missing configuration creates a vulnerability rather than an error.
**Prevention:** Always explicitly check if the secret/environment variable exists (`if (!secret)`) before performing the comparison, or ensure the application fails to start if critical secrets are missing.

## 2026-01-15 - Middleware IDOR/Spoofing Vulnerability
**Vulnerability:** The application relied on 'x-user-id' headers for authentication but lacked a 'middleware.ts' to strip incoming headers, allowing attackers to spoof any user ID. A non-functional 'proxy.ts' file existed but did not run globally or strip headers.
**Learning:** Non-standard file naming ('proxy.ts') caused security logic to be ignored by the framework. Trusting headers without upstream verification is a critical flaw.
**Prevention:** Use standard 'middleware.ts' for Next.js. Explicitly strip sensitive headers at the entry point before verifying session and re-injecting them.
