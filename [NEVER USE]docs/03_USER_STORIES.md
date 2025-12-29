# 03. User Stories

## 3.1 Senior User Stories (The Storyteller)

| ID | Priority | Story | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **S-01** | P0 | As a Senior, I want to start a conversation with one tap so that I don't get frustrated by technology. | - Big "Start" button on home screen.<br>- No login required if using magic link.<br>- Audio permissions handled gracefully. |
| **S-02** | P0 | As a Senior, I want to talk naturally without holding a button (hands-free) so I can relax. | - VAD (Voice Activity Detection) automatically detects end of speech.<br>- System handles long pauses without cutting off. |
| **S-03** | P1 | As a Senior, I want to show a photo to the AI so we can talk about it. | - "Show Photo" button available.<br>- AI acknowledges photo content in the very next sentence. |
| **S-04** | P2 | As a Senior, I want to review what we talked about later. | - Access to "My Stories" list.<br>- Ability to play back audio highlights. |

---

## 3.2 Family User Stories (The Custodian)

| ID | Priority | Story | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **F-01** | P0 | As a Family member, I want to configure topics to avoid so the AI doesn't upset my parent. | - Settings page with "Topics to Avoid" list.<br>- AI System Prompt includes negative constraints. |
| **F-02** | P1 | As a Family member, I want to be notified when a new story is captured. | - Email notification sent on "Chapter Generated" event.<br>- Link takes me directly to the story. |
| **F-03** | P2 | As a Family member, I want to download the stories as a PDF/Book. | - "Export" button generates formatted PDF.<br>- Includes photos and text. |

---

## 3.3 System Stories (The Backend)

| ID | Priority | Story | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **SYS-01** | P0 | As the System, I must decompose long transcripts into atomic facts (AoT) so I can write high-quality chapters. | - Transcript > 1000 words processed via AoT adapter.<br>- Narrative Arc, Quotes, and Sensory details extracted. |
| **SYS-02** | P0 | As the System, I must monitor for crisis keywords so I can alert family. | - Regex/AI scan on every user message.<br>- Email triggered to `emergencyContact` if match found. |
| **SYS-03** | P1 | As the System, I must maintain context across sessions so the AI doesn't ask the same questions. | - Vector store (Pinecone) retrieval of past summaries before session start.<br>- AI Director prompt includes "What we know". |
