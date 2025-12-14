# 04. Technical Architecture

## 1. Frontend Architecture

### Framework
-   **Next.js 16+ (App Router):** Leveraging React Server Components (RSC) for dashboard performance and Client Components for the heavy interactive voice interface.
-   **Language:** TypeScript (Strict).

### State Management
-   **Global State:** Zustand. Used for active session state (isRecording, audioLevel, currentTranscript).
-   **Server State:** React Server Actions + SWR/TanStack Query (if needed for client-side fetching).

### UI System
-   **Styling:** Tailwind CSS v4.
-   **Components:** Shadcn/UI (Radix Primitives).
-   **Animations:** `tw-animate-css` + Custom CSS for organic voice visualizers.

### Audio Handling
-   **Web Audio API:** For capturing microphone input and analyzing frequency data for visualizers.
-   **Streaming:** Handling chunked audio responses from ElevenLabs to minimize TTFB (Time To First Byte).

## 2. Backend Architecture

### Runtime
-   **Serverless/Edge:** Next.js API Routes hosted on Vercel.
-   **Long-Running Processes:** Background jobs (Chapter Generation) offloaded to a worker pattern (e.g., Vercel Cron or external worker if timeout limits are hit).

### API Design
-   **RESTful:** Standard resource-based routes (`/api/sessions`, `/api/users`).
-   **Typed Inputs:** Zod for runtime request validation.
-   **Dependency Injection:** `lib/infrastructure/di/container.ts` acts as the composition root, injecting adapters into use cases.

### Authentication & Authorization
-   **Auth Strategy:** (Assuming NextAuth/Clerk or Custom - verifying implementation). *Note: Implementation details suggest custom or minimal auth for MVP, focusing on `userId` headers or simple tokens.*
-   **RBAC:** Role checks in Use Cases (`User.role === 'senior'`).

### Configuration
-   **Environment Variables:** Managed via `.env.local` (Dev) and Vercel Project Settings (Prod).
-   **Secrets:** `OPENAI_API_KEY`, `GOOGLE_VERTEX_CREDENTIALS`, `ELEVENLABS_API_KEY`, `PINECONE_API_KEY`.

## 3. Communication Patterns

-   **Synchronous:** User UI <-> Backend API (Request/Response).
-   **Asynchronous:**
    -   Backend <-> AI Services (often streaming responses).
    -   Session Completion -> Chapter Generation (Fire-and-forget job).

## 4. Dependencies
-   `@google-cloud/vertexai`: Core logic.
-   `@elevenlabs/elevenlabs-js`: Voice I/O.
-   `drizzle-orm` + `postgres`: Persistence.
-   `@pinecone-database/pinecone`: Long-term memory.
