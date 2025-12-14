# 06. Data & Database Design

## 1. Conceptual Data Model

-   **User:** The root entity. Can be Senior or Family.
-   **Session:** An event where a Senior interacts with the AI. Contains the raw "Data".
-   **Chapter:** The processed "Wisdom" derived from Sessions.
-   **Invitation:** A scheduled intent to have a Session.
-   **Alert:** A safety signal derived from Session content.

## 2. Logical Schema (PostgreSQL)

### `users`
-   `id` (UUID, PK)
-   `name` (VarChar)
-   `email` (VarChar, Unique)
-   `role` (Enum: 'senior', 'family')
-   `preferences` (JSONB): Stores dynamic settings like `topicsLove`, `timezone`.

### `sessions`
-   `id` (UUID, PK)
-   `user_id` (FK -> users.id)
-   `transcript_raw` (Text/JSON): Complete log.
-   `audio_url` (VarChar): Link to blob storage.
-   `metadata` (JSONB): Stats, sentiment scores.

### `chapters`
-   `id` (UUID, PK)
-   `session_id` (FK -> sessions.id)
-   `title` (VarChar)
-   `content` (Text): The narrative story (Markdown).
-   `entities` (JSONB): extracted people/places. **GIN Indexed**.
-   `pdf_url` (VarChar)

### `invitations`
-   `id` (UUID, PK)
-   `senior_id` (FK -> users.id)
-   `scheduled_for` (Timestamp)
-   `status` (Enum: pending, sent, answered, missed)

## 3. Vector Database (Pinecone)

Used for Long-Term Semantic Memory (RAG).

### Index Structure
-   **Vectors:** 768 or 1536 dimensions (depending on embedding model, e.g., Vertex vs OpenAI).
-   **Metadata:**
    -   `userId`: Partitioning key.
    -   `sessionId`: Provenance.
    -   `type`: 'fact' | 'story' | 'preference'.
    -   `timestamp`: Temporal filtering.

## 4. Data Lifecycle

1.  **Creation:** Real-time during Session.
2.  **Processing:** Immediately post-session (Chapter Gen, Vector Embedding).
3.  **Archival:** Raw Audio moves to cold storage after X days (cost optimization). Transcripts kept forever.
4.  **Deletion:** User Request (GDPR "Right to be Forgotten") triggers cascade delete in Postgres + Pinecone delete by `userId`.
