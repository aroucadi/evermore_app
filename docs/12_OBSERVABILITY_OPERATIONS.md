# 12. Observability & Operations

## 12.1 Logging Strategy

We practice **Structured Logging**. Every log entry is a JSON object, not a string.

### **What We Log**
-   **Request ID:** `x-request-id` propagated through all layers.
-   **Context:** `userId`, `sessionId`, `component` ("GeminiAdapter", "AudioPipeline").
-   **Events:**
    -   `voice_session.started`
    -   `chapter.generated` (with token_usage stats)
    -   `error.captured`

### **What We NEVER Log**
-   **PII:** Email addresses, Phone numbers (masked).
-   **Raw Content:** The user's audio binary, the raw transcript text (unless debug level enabled for specific user with consent).
-   **Secrets:** API Keys, DB Passwords.

---

## 12.2 Metrics & Dashboards

### **AI Metrics**
-   **Token Usage:** Prompt Tokens vs Completion Tokens (Cost driver).
-   **Latency:**
    -   `llm_ttfb`: Time to first token.
    -   `tts_latency`: Time to audio ready.
-   **Quality:**
    -   `retry_rate`: How often we retry LLM calls due to JSON parse errors.

### **System Metrics**
-   **Database:** Connection pool utilization.
-   **Vercel:** Function invocation duration.

---

## 12.3 Incident Playbooks

### **Scenario A: Vertex AI Outage**
**Detection:** `llm_error_rate` spikes > 10%.
**Resolution:**
1.  **Ack** via PagerDuty.
2.  **Flip Feature Flag:** `ENABLE_OPENAI_FALLBACK = true`.
3.  **Verify:** Check logs to see OpenAI adapter taking traffic.
4.  **Communicate:** Update Status Page: "AI Provider Degradation - Failed over to backup."

### **Scenario B: Database Connection Limit**
**Detection:** Log errors `too_many_connections`.
**Resolution:**
1.  **Immediate:** Kill idle queries.
2.  **Short-term:** Increase pool size in `drizzle.config`.
3.  **Long-term:** Implement PgBouncer or scale Neon compute.
