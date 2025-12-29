# 13. Launch, Growth & Scale Strategy

## 13.1 Launch Phases

### **Phase 1: Alpha ("The Family Circle")**
-   **Goal:** Validation of "The Proust Effect". Does it actually work emotionally?
-   **Scale:** 10 Seniors.
-   **Strategy:** High-touch. Founder manually onboards each senior.
-   **Success Metric:** 5/10 seniors complete 3+ sessions.

### **Phase 2: Beta ("The Waitlist")**
-   **Goal:** Stress test Infrastructure & Cost Economics.
-   **Scale:** 100-500 Users.
-   **Strategy:** Invite codes. Drip feed access.
-   **Economics:** Monitor "Cost Per Chapter". Target < $0.50.

### **Phase 3: General Availability (GA)**
-   **Goal:** Growth.
-   **Strategy:** Referral Loops (Family invites Senior).

---

## 13.2 Adoption Strategy

### **The "Custodian" Loop**
We target the *Adult Children* (30-50s), not the seniors directly.
1.  **Hook:** "Don't let Mom's stories fade away."
2.  **Action:** Child buys subscription -> Sends magic link to Mom.
3.  **Reward:** Child gets the first Chapter via email.

### **Retention Levers**
1.  **Sunday Ritual:** Auto-schedule calls for Sunday afternoons.
2.  **Printed Book:** The physical artifact is the ultimate retention hook. You don't churn until you get the book.

---

## 13.3 Scaling Bottlenecks

### **1. Concurrent Voice Streams**
-   **Limit:** WebSocket connections per server instance.
-   **Solution:** Horizontal scaling of Next.js / Separate WebSocket Server (e.g., PartyKit) if Vercel limits are hit.

### **2. Database Writes**
-   **Limit:** Postgres connections.
-   **Solution:** Read Replicas for the "Feed" (Read-heavy).

### **3. Cost**
-   **Limit:** Vertex/ElevenLabs bills.
-   **Solution:**
    -   Cache TTS for common phrases ("Hello", "Good to see you").
    -   Switch to "Flash" models for summarization tasks.
