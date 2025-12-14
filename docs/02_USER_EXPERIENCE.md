# 02. User Experience & Functional Design

## 1. End-to-End User Journeys

### Journey A: Onboarding (Family Led)
1.  **Sarah (Family)** signs up via Landing Page.
2.  Creates profile for **Arthur (Senior)** (Name, Topics to Avoid, Emergency Contact).
3.  Sarah uploads 3-5 "Anchor Photos" to seed the first conversation.
4.  Sarah receives a unique "Companion Link" to share with Arthur (or set up on his iPad).

### Journey B: The Active Session (Senior)
1.  Arthur opens the Companion Link.
2.  **Voice Greeting:** "Hi Arthur, Sarah shared this photo of you at the lake. It looks like a wonderful day. Can you tell me about it?" (Proustian Trigger).
3.  **Conversation:** Arthur speaks. The AI responds naturally, asking follow-up questions based on the "Atom of Thoughts" strategy.
4.  **Conclusion:** After ~15 mins or detecting fatigue, AI wraps up: "Thank you, Arthur. I've saved that story. Let's talk again soon."

### Journey C: The Reflection (Family)
1.  System processes audio -> Transcribes -> Generates Chapter.
2.  Sarah receives email notification: "New Chapter: The Lake House Summer".
3.  Sarah views the Chapter on the Family Dashboard, reads the text, listens to audio highlights.
4.  Sarah can edit/comment or "Star" the chapter for the printed book.

## 2. Functional Requirements

### FR-01: Voice Interaction
-   **Latency:** <2s voice-to-voice response time.
-   **Interruption:** System must handle user interruptions gracefully.
-   **Voice Quality:** Empathetic, clear, senior-friendly voice (ElevenLabs).

### FR-02: Memory & Context
-   **Session History:** AI must remember facts from previous sessions (e.g., "How is your grandson, Timmy?").
-   **Context Window:** Utilize RAG (Pinecone) to pull relevant past context.

### FR-03: Artifact Generation
-   **Transcription:** High-accuracy STT.
-   **Narrative Generation:** Convert conversational transcript into third-person or first-person narrative prose.
-   **Entity Extraction:** Identify People, Places, Dates for the "Memory Graph".

### FR-04: Safety
-   **Keyword Detection:** Real-time monitoring for words like "Fall", "Chest Pain", "Suicide".
-   **Alerting:** Immediate email/SMS to Emergency Contact if triggered.

## 3. Non-Functional Requirements

-   **Accessibility:** WCAG 2.1 AA Compliance. High contrast, large touch targets.
-   **Reliability:** 99.9% Uptime during waking hours (8am - 10pm local).
-   **Privacy:** All data encrypted at rest and in transit. HIPAA-compliant handling of health-related data (even if not a medical device).

## 4. User Stories (INVEST)

### US-01: Start Conversation
> As Arthur, I want to start a conversation with one tap so that I don't get frustrated by technology.
> *Acceptance Criteria:* Large "Start" button, immediate voice greeting, no login screen for recognized device.

### US-02: Visual Trigger
> As Sarah, I want to upload a photo so that the AI can ask my dad specifically about that memory.
> *Acceptance Criteria:* Photo upload widget, AI analyzes image content, AI formulates opening question based on image.

### US-03: View Chapter
> As Sarah, I want to read a summarized story of the conversation so that I can quickly understand what Dad talked about.
> *Acceptance Criteria:* Web page with Title, Narrative Body, Audio Player, Key Entities listed.

### US-04: Safety Alert
> As a System, I want to detect "Help" keywords so that I can notify the family immediately.
> *Acceptance Criteria:* Regex/Semantics match on transcript stream -> Trigger EmailService -> Log Alert.
