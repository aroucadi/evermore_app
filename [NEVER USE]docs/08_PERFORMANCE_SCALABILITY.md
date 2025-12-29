# 08. Performance & Scalability

## 8.1 Performance Goals (SLAs)

| Metric | Target | Warning Threshold |
| :--- | :--- | :--- |
| **TTFB (Web)** | < 200ms | > 500ms |
| **Voice Latency (Turn-taking)** | < 1.5s | > 3s |
| **Chapter Generation Time** | < 2 minutes | > 5 minutes |
| **Database Query Time (P95)** | < 50ms | > 100ms |

---

## 8.2 Bottleneck Analysis

1.  **Voice Latency:** The round trip (User -> STT -> LLM -> TTS -> User) is the biggest risk.
    -   *Mitigation:* Use ElevenLabs "Turbo" models. Stream audio chunks immediately (don't wait for full buffer).

2.  **LLM Rate Limits:** Vertex AI has quotas.
    -   *Mitigation:* Implement exponential backoff retry logic (already in `GeminiService`). Use a queue for non-critical tasks (Chapter Gen).

3.  **Database Connections:** Serverless Postgres (Neon) can run out of connections.
    -   *Mitigation:* Use connection pooling (PgBouncer) or Drizzle's HTTP driver.

---

## 8.3 Caching Strategy

1.  **Static Assets:** Served via Vercel Edge Network (CDN).
2.  **API Responses:** `Next.js` Cache (revalidate tags) for fetching Chapters (`revalidateTag('chapters')`).
3.  **Vector Search:** Pinecone has internal caching; we cache the `session_context` in memory during active voice sessions.

---

## 8.4 Load Testing Strategy

-   **Tool:** K6 or Artillery.
-   **Scenario:** 100 concurrent voice sessions.
-   **Success:** < 1% Websocket drop rate.

---

## 8.5 Scaling

-   **Horizontal:** Next.js (Frontend/API) scales infinitely on Vercel/AWS Lambda.
-   **Vertical:** Database needs vertical scaling if storage > 100GB.
-   **Job Workers:** Background jobs (Chapter Gen) should be moved to a dedicated worker fleet (e.g., Temporal/BullMQ) if volume exceeds 1000 chapters/hour.
