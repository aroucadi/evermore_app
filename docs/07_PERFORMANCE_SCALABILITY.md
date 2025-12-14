# 07. Performance & Scalability

## 1. Performance Goals

-   **Voice Latency:** < 1500ms (Total round-trip from silence to AI voice).
    -   *Bottleneck:* LLM Inference + TTS Generation.
    -   *Mitigation:* Streaming responses, faster models (Gemini Flash), optimistically pre-fetching TTS.
-   **Page Load:** < 1s (LCP) for Dashboard.
    -   *Enabler:* Next.js Server Components, minimal client-side hydration.

## 2. Scalability Strategy

### Database (Postgres)
-   **Vertical:** Upgrade instance size for initial growth.
-   **Horizontal:** Read Replicas for Dashboard queries (heavy read load).
-   **Partitioning:** Partition `sessions` and `chapters` by time or `userId` if table size exceeds 100GB.

### Vector Search (Pinecone)
-   **Managed Service:** Pinecone handles horizontal scaling of pods/indexes.
-   **Optimization:** Use `namespaces` per tenant (if multi-tenant B2B) or metadata filtering (current B2C model).

### Compute (Next.js/Vercel)
-   **Serverless:** Auto-scales with request volume.
-   **Limit:** Database connection pool. Use connection pooling (Supabase Transaction Mode / PgBouncer).

## 3. Caching Strategy

-   **Application Cache:** React `cache()` for deduping requests in a single render pass.
-   **Data Cache:** `unstable_cache` (Next.js) for expensive DB queries (e.g., "Get All Chapters") with tag-based revalidation.
-   **Static Assets:** CDN (Vercel Edge Network) for Images, Audio, Fonts.

## 4. Stress Testing Plan

-   **Tool:** K6 or Artillery.
-   **Scenario:** 50 concurrent active voice sessions.
-   **Monitor:** Latency spikes in ElevenLabs API and DB Connection saturation.
