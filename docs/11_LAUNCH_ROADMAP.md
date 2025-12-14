# 11. Launch Roadmap & Future Evolution

## 1. Launch Readiness Checklist (Go/No-Go)

-   [ ] **Legal:** Terms of Service & Privacy Policy updated for AI Voice.
-   [ ] **Billing:** Stripe subscription flow active (if paid).
-   [ ] **Quotas:** Vertex AI and ElevenLabs quotas increased for production traffic.
-   [ ] **Security:** Penetration test (basic) complete. Secrets rotated.
-   [ ] **Support:** Support email alias (`help@recall.com`) routed to team.

## 2. Risk Assessment

-   **High:** AI hallucination in Chapters. *Mitigation:* Disclaimer on all generated content. "AI generated - verify with Arthur."
-   **High:** Cost spiraling. *Mitigation:* Hard caps on API spend per user/day.
-   **Medium:** Senior rejection of "Robot Voice". *Mitigation:* High-quality ElevenLabs voices, "Human-in-loop" onboarding.

## 3. Roadmap (Post-MVP)

### Phase 1: Deepening Connection (Q2)
-   **Multi-Modal Input:** Allow Senior to upload photos during the call.
-   **Physical Book Printing:** Integration with print-on-demand service.

### Phase 2: Proactive Health (Q3)
-   **Cognitive Tracking:** Longitudinal analysis of vocabulary and memory recall to detect decline trends.
-   **Integration:** APIs for Care Providers / EMR systems.

### Phase 3: The Digital Twin (Q4+)
-   **Interactive Avatar:** 3D or Video avatar synced to voice.
-   **Legacy Chat:** Allow great-grandchildren to "chat" with the preserved memories (strictly opt-in).

## 4. Technical Debt Strategy

-   **Current Debt:**
    -   "Magic String" Prompts scattered in code. -> *Plan:* Move to a Prompt Registry / CMS.
    -   Polling for Job completion. -> *Plan:* Implement WebSockets/SSE for real-time updates.
    -   Monolithic API Routes. -> *Plan:* Refactor to distinct Microservices if team scales > 5 devs.
