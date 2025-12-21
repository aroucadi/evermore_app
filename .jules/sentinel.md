## 2024-05-23 - Default-Value Auth Bypass in Cron Jobs
**Vulnerability:** The cron job endpoint checked `authHeader !== 'Bearer ' + process.env.CRON_SECRET`. When `CRON_SECRET` was undefined, this resolved to `"Bearer undefined"`, allowing attackers to bypass authentication by sending that exact header string.
**Learning:** Relying on implicit string concatenation with environment variables can create accidental "fail-open" scenarios where a missing configuration creates a vulnerability rather than an error.
**Prevention:** Always explicitly check if the secret/environment variable exists (`if (!secret)`) before performing the comparison, or ensure the application fails to start if critical secrets are missing.

## 2024-05-23 - Time-Constant String Comparison
**Vulnerability:** Direct string comparison (`===` or `!==`) allows attackers to deduce the secret length and content by measuring response times (Timing Attack).
**Learning:** Even in higher-level languages like JS/TS, secret comparison must be time-constant to prevent side-channel attacks.
**Prevention:** Use `crypto.timingSafeEqual` for all secret comparisons (API keys, tokens). Ensure buffers are of equal length before comparing to avoid errors.
