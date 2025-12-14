# 05. Algorithmic & Logic Design

## 1. Core Logic: The "Director" Pattern

The system does not simply "reply" to user input. It acts as a Director orchestrating a scene.

### Decision Flow
1.  **Input:** User Audio -> Text.
2.  **Analysis:**
    -   *Sentiment Analysis:* Is the user happy, sad, agitated?
    -   *Topic Detection:* What are we talking about?
    -   *Context Retrieval:* Have we discussed this before? (Pinecone Query).
3.  **Strategy Selection (Gemini):**
    -   *Dig Deeper:* Ask for sensory details ("What did it smell like?").
    -   *Pivot:* Change topic if user seems bored/uncomfortable.
    -   *Wrap Up:* End session if fatigue detected.
4.  **Generation:** Construct the response using the selected strategy and retrieved context.

## 2. Atom of Thoughts (AoT) for Chapters

Chapter generation is computationally expensive and requires high literary quality. We use AoT decomposition.

### Process
1.  **Decomposition:** Break the raw transcript into "atomic facts" or "beats".
2.  **Entity Mapping:** Link beats to known entities (People, Places).
3.  **Synthesis:**
    -   Generate a "Narrative Arc" (Outline).
    -   Draft paragraphs in parallel (if long) or sequentially.
    -   Review & Refine (Self-Correction loop for tone and consistency).
4.  **Output:** Structured Markdown with Metadata.

## 3. Proustian Trigger (Visual Anchoring)

Logic for starting a session with an image.

### Algorithm
1.  **Image Analysis:** Extract objects, setting, time period, mood.
2.  **Memory Association:** Search Vector DB for keywords found in image analysis.
3.  **Prompt Engineering:**
    -   *Template:* "You are looking at a photo of {description}. It relates to {memory_context}. Ask a question to evoke a story."
4.  **Output:** A specific, evocative opening question.

## 4. State Management

### Active Session State (In-Memory/Zustand + DB)
-   `transcript`: Array of `{role, content, timestamp}`.
-   `status`: `connecting` | `speaking` | `listening` | `processing`.
-   `audioContext`: Web Audio API nodes.

### Persisted State (Postgres)
-   `SessionStatus`: `active` -> `completed` -> `archived`.
-   `JobStatus`: `pending` -> `processing` -> `completed`.
