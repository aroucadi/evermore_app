# 05. Technical Architecture

## 5.1 Technology Choices & Rationale

### **Framework: Next.js 15+ (App Router)**
-   **Why:** We need a tight coupling between Frontend and Backend for low-latency voice interactions (Server Actions). The React Server Components (RSC) model allows us to render heavy dashboards on the server, keeping the client bundle small for seniors on older devices.
-   **Alternatives:** React SPA + Python (FastAPI). Rejected because splitting the stack adds complexity to type sharing and deployment.
-   **Risks:** Vercel lock-in (mitigated by clean arch; can export to Docker).

### **Database: PostgreSQL + Drizzle ORM**
-   **Why:**
    -   **Postgres:** Reliable, supports JSONB (vital for storing dynamic `Chapter` structures and flexible `User` preferences) and Vector extensions (`pgvector` - though we use Pinecone for now, the option is there).
    -   **Drizzle:** Lightweight, "If you know SQL, you know Drizzle." Zero runtime overhead compared to Prisma.
-   **Alternatives:**
    -   *Prisma:* Too heavy, cold start issues in serverless.
    -   *Mongo:* Too loose. We need relational integrity for User-Senior mappings.

### **AI Core: Google Vertex AI (Gemini 1.5 Pro)**
-   **Why:**
    -   **Context Window:** 1M+ tokens allows us to dump *entire* previous sessions into context without RAG complexity for medium-length histories.
    -   **Multimodal:** Native understanding of video/images for "Proustian Triggers" is superior to GPT-4V in our benchmarks.
    -   **JSON Mode:** Extremely reliable structured output.
-   **Alternatives:** OpenAI (GPT-4o). Kept as a fallback adapter.

### **Voice: ElevenLabs**
-   **Why:** Best-in-class emotional range. We can programmatically inject `<break time="1.0s" />` and stability settings to simulate patience and empathy.
-   **Tradeoff:** Expensive. We mitigate by caching common phrases (intro/outro) if possible (future optimization).

---

## 5.2 Failure Modes & Resilience

1.  **"The Silent Treatment" (AI Timeout)**
    -   *Scenario:* Vertex AI takes > 10s to respond.
    -   *Fallback:* Circuit Breaker trips. System plays a pre-recorded "Hmm, let me think about that for a moment..." audio file locally while waiting, or switches to a faster, dumber model (Gemini Flash).

2.  **"The Amnesiac" (Context Loss)**
    -   *Scenario:* Vector Store is down.
    -   *Degradation:* The Director proceeds with *only* the current session transcript. It acknowledges: "I'm having trouble recalling our past talks, but I'm listening now."

3.  **"The Hallucination" (Bad Chapter)**
    -   *Scenario:* AI writes a chapter about a war the user was never in.
    -   *Safety:* Family (Custodian) must approve/edit chapters before they are "Finalized." The system is "Human-in-the-Loop."

---

## 5.3 API Design

Our API is not a generic REST API; it is a **Purpose-Built Remote Interface**.

-   **Public Routes:** Limited. Mostly `/auth/*` and Webhooks.
-   **Protected Routes:** All business logic acts behind `api/protected/*`.
-   **Streaming:** `POST /api/chat` returns a `Transfer-Encoding: chunked` stream to lower Time-To-First-Byte (TTFB) for text generation, allowing the UI to show a "typing" animation.

---

## 5.4 State Management

-   **Server:** Stateless. Source of truth is DB.
-   **Client (Zustand):**
    -   Manages `AudioContext`, `MicStream`, and `WebSocket` connection status.
    -   Ephemeral. If the user refreshes, the "Active Voice Call" state is lost (intentionally), but the *Session* persists in the DB.
