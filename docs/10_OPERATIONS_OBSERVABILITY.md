# 10. Operations & Observability

## 1. Logging

-   **Application Logs:** `console.log` / `console.error` in structured JSON format (pino/winston). Captured by Vercel Logs.
-   **Audit Logs:** Critical actions (Delete Account, Change Settings) written to `audit_logs` table in DB.

## 2. Monitoring

-   **Performance:** Vercel Analytics (Web Vitals).
-   **Errors:** Sentry (Frontend + Backend). Capture stack traces and breadcrumbs.
-   **AI Usage:** Custom dashboard tracking Token Usage (Cost) and API Latency.

## 3. Alerting

-   **Critical:**
    -   DB Connection Failure.
    -   API Error Rate > 5%.
    -   ElevenLabs Credit Depletion.
    -   *Channel:* Slack #ops-alerts / PagerDuty.
-   **Warning:**
    -   High Latency (>3s).
    -   Job Queue Backup.

## 4. Operational Runbooks

### RB-01: Stuck Job Handling
*Symptom:* Chapter not generated after 1 hour.
1.  Check `jobs` table for `status = 'processing'` with old `started_at`.
2.  Check Logs for that Job ID.
3.  If crash, manually set status to `pending` to retry, or `failed` if deterministic error.

### RB-02: Safety Alert Verification
*Symptom:* Email received "Crisis Detected".
1.  Family member contacts support or checks dashboard.
2.  Support Admin reviews Session Transcript (Access requires "Break Glass" protocol).
3.  Confirm if False Positive. Adjust prompt sensitivity if recurring.
