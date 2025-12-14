# 03. System Architecture

## 1. High-Level Overview

The system utilizes a **Hexagonal Architecture (Ports & Adapters)** to decouple core business logic from infrastructure and external AI services. This ensures testability and the ability to swap AI providers (e.g., Vertex AI -> OpenAI) without affecting domain logic.

**Core Layers:**
1.  **Domain Layer:** Pure TypeScript entities and business rules (User, Session, Chapter).
2.  **Application Layer:** Use Cases orchestrating flow (StartSession, GenerateChapter).
3.  **Infrastructure Layer:** Adapters for DB, External APIs, UI.

## 2. Component Responsibilities

### Frontend (Next.js App Router)
-   **Conversation UI:** WebRTC/WebSocket client for audio streaming, Visualizers, Permissions management.
-   **Dashboard:** Data visualization for Chapters, User management forms.

### Backend (Next.js API Routes / Server Actions)
-   **Orchestrator:** Manages session state, routes audio chunks, handles RAG retrieval.
-   **Worker:** Asynchronous processing for Chapter Generation and Long-running tasks.

### AI Services
-   **Cognitive Core (The Director):** Google Vertex AI (Gemini 1.5 Pro). Responsible for strategy, context analysis, and narrative generation.
-   **Voice Interface:** ElevenLabs. STT (Speech-to-Text) and TTS (Text-to-Speech).
-   **Visual Analysis:** Gemini Vision. Analyzes uploaded images for conversational triggers.

### Data Storage
-   **Relational DB:** PostgreSQL (via Drizzle ORM). User data, session metadata, structured chapters.
-   **Vector DB:** Pinecone. Semantic search for long-term memory retrieval.
-   **Blob Storage:** Cloud Storage (S3/Vercel Blob). Raw audio files, images.

## 3. Data Flow Diagrams

### Voice Conversation Loop
1.  **User Speaks** -> [Microphone] -> [Browser] -> (Stream) -> [ElevenLabs STT]
2.  [ElevenLabs] -> (Transcript Text) -> [Recall Backend]
3.  [Recall Backend] -> (Query) -> [Pinecone] -> (Context)
4.  [Recall Backend] -> (Context + Transcript) -> [Gemini (Director)] -> (Response Text + Strategy)
5.  [Gemini] -> (Response Text) -> [ElevenLabs TTS] -> (Audio Stream)
6.  [ElevenLabs TTS] -> (Audio) -> [Browser] -> [Speaker]

### Chapter Generation Pipeline (Async)
1.  **Session Ends** -> [Event Bus] -> [Job Queue]
2.  [Job Worker] -> (Fetch Transcript) -> [DB]
3.  [Job Worker] -> (Transcript) -> [AoT Generator (Gemini)] -> (Draft Narrative)
4.  [Job Worker] -> (Draft) -> [DB (Chapter Table)]
5.  [Job Worker] -> (Notify) -> [Email Service]

## 4. Sequence Diagrams (Textual)

### Start Session with Image Trigger
1.  **User** uploads Image.
2.  **Frontend** sends Image + UserID to `AnalyzeSessionImageUseCase`.
3.  **UseCase** calls `AIServicePort.analyzeImage(image)`.
4.  **AIService (Gemini)** returns `conversationalTrigger` string.
5.  **UseCase** initiates `Session` entity with `trigger`.
6.  **UseCase** calls `AIService.generateSpeech(trigger)`.
7.  **Backend** returns Audio + SessionID to **Frontend**.
8.  **Frontend** plays audio (Greeting).
