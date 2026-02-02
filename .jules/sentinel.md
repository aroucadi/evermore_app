## 2024-05-23 - Default-Value Auth Bypass in Cron Jobs
**Vulnerability:** The cron job endpoint checked `authHeader !== 'Bearer ' + process.env.CRON_SECRET`. When `CRON_SECRET` was undefined, this resolved to `"Bearer undefined"`, allowing attackers to bypass authentication by sending that exact header string.
**Learning:** Relying on implicit string concatenation with environment variables can create accidental "fail-open" scenarios where a missing configuration creates a vulnerability rather than an error.
**Prevention:** Always explicitly check if the secret/environment variable exists (`if (!secret)`) before performing the comparison, or ensure the application fails to start if critical secrets are missing.

## 2024-02-02 - Unsanitized markdown-like replacement
**Vulnerability:** The `BookPage` component used `dangerouslySetInnerHTML` to render text where `*italic*` was replaced with `<em>italic</em>` using regex, but the input text was not sanitized first, allowing XSS.
**Learning:** When performing manual string manipulation to insert HTML tags (like for custom markdown support), you must sanitize the *entire* string first (e.g. `escapeHtml(input)`) before inserting your own safe HTML tags.
**Prevention:** Always use a dedicated Markdown library with sanitization enabled, or if implementing custom logic, ensure all user input is escaped before adding HTML markup.
