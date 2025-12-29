# 02. User Experience & Functional Design

## 2.1 End-to-End User Journeys

### **Journey A: The Onboarding (Family Led)**
1.  **Setup:** Family member (Custodian) signs up, pays subscription, and creates a profile for the Senior.
2.  **Configuration:** Custodian inputs "Memory Seeds" (topics to cover, topics to avoid, key life events).
3.  **Invite:** Senior receives an email/SMS link. No password required (magic link).
4.  **First Impression:** Senior opens the link on iPad/Phone. They see a warm, simple interface with a "Start Talking" button.

### **Journey B: The Interview (Senior Led)**
1.  **Trigger:** Senior uploads a photo of their wedding (Visual Memory Anchor).
2.  **Analysis:** System analyzes the image (People: 2, Setting: Church, Time: 1960s).
3.  **The Hook:** AI Director asks: "That looks like a beautiful ceremony. I see you're holding white lilies. Tell me about that moment?"
4.  **Conversation:** Senior speaks. AI listens, acknowledges ("Mhm", "I see"), and digs deeper ("How did you feel when you saw him waiting at the altar?").
5.  **Conclusion:** After ~15 mins or natural lull, AI wraps up: "Thank you for sharing that. Let's pause here."

### **Journey C: The Consumption (Family)**
1.  **Notification:** Custodian gets an alert: "New Chapter: 'The Wedding Day' is ready."
2.  **Review:** Custodian reads the polished narrative, listens to audio highlights, and sees the associated photo.
3.  **Feedback:** Custodian can "Star" the chapter or request an edit.

---

## 2.2 User Flows

### **Start Session Flow**
`[Dashboard] -> [Upload Photo (Optional)] -> [Mic Check] -> [Voice Session Active]`

### **Voice Interaction Loop**
`[User Speaks] -> [Silence Detection] -> [STT] -> [Director Logic (Plan)] -> [TTS Response] -> [User Hears Response]`

### **Chapter Generation Flow (Async)**
`[Session End] -> [Transcript Processed] -> [AoT Decomposition] -> [Synthesis] -> [Draft Ready] -> [Notify User]`

---

## 2.3 Functional Requirements

1.  **Voice Interface:**
    -   Must support full-duplex or turn-based conversation.
    -   Must handle interruptions gracefully.
    -   Must have a visible "Listening" indicator.

2.  **Visual Memory Anchoring:**
    -   Must accept image uploads (JPEG/PNG).
    -   Must analyze images for context *before* starting the conversation.

3.  **Safety Monitor:**
    -   Must detect keywords related to medical emergencies or severe distress (depression/suicide).
    -   Must trigger an email alert to the Emergency Contact defined in `User.preferences`.

4.  **Scheduling:**
    -   Must allow scheduling of recurring "Interview Times".
    -   Must handle timezone conversions between Senior and Family.

---

## 2.4 Non-Functional Requirements

-   **Accessibility:** WCAG 2.1 AA Compliance. High contrast mode, large touch targets (>48px).
-   **Latency:** Voice-to-Voice response time under 2 seconds to maintain conversational flow.
-   **Reliability:** Session audio must be saved locally or buffered to prevent data loss on disconnect.

---

## 2.5 Error Handling & Fallback

-   **Network Drop:** If socket disconnects, UI shows "Reconnecting..." and pauses recording. Audio buffer flushes to server on reconnect.
-   **Silence:** If user is silent for >10s, AI prompts: "Are you still there?" or "Take your time."
-   **Unintelligible Speech:** AI responds: "I missed that last part, could you repeat it?" rather than hallucinating.
