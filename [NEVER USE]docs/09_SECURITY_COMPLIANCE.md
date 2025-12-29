# 09. Security, Privacy & Compliance

## 9.1 Threat Model & Defenses

| Threat | Description | Mitigation Strategy | Implementation |
| :--- | :--- | :--- | :--- |
| **Prompt Injection** | User tricking AI into saying forbidden things. | **System Prompt Fencing**: "You are Recall. You do not discuss politics. If asked, politely decline." | `SystemPrompts.ts` |
| **IDOR** | User A accessing User B's chapter. | **RLS (Row Level Security)**: Every DB query includes a `where(eq(userId, session.user.id))` clause. | `DrizzleRepository` |
| **XSS** | Malicious script in Chapter content. | **Sanitization**: All markdown rendered via `react-markdown` with strict HTML filtering. | `ChapterView.tsx` |
| **MITM** | Eavesdropping on audio. | **TLS 1.3**: Enforced by Vercel. WebSockets use `wss://`. | Infrastructure |

---

## 9.2 Data Privacy & Lifecycle

### **Data Classification**
-   **Public:** Marketing pages.
-   **Internal:** User Email, Subscription Status.
-   **Confidential:** Voice Recordings, Transcripts, Chapters. (Encrypted at Rest).
-   **Restricted:** Emergency Contact, Health Data (if mentioned).

### **Encryption**
-   **At Rest:** AES-256 (Postgres storage level).
-   **In Transit:** TLS 1.3.
-   **Secrets:** Encrypted Environment Variables (Vercel).

### **Secrets Management**
-   **Rule:** NO SECRETS IN CODE.
-   **Detection:** `git-secrets` or pre-commit hooks scan for `sk-...` patterns.
-   **Rotation:**
    -   *Automated:* Not yet implemented.
    -   *Manual:* Quarterly rotation of ElevenLabs/Vertex keys.

---

## 9.3 Compliance (GDPR/CCPA)

### **Right to Access (Article 15)**
-   **Mechanism:** `GET /api/user/export`.
-   **Output:** JSON dump of User Profile, Sessions, and Chapters.

### **Right to Erasure (Article 17)**
-   **Mechanism:** `DELETE /api/user/me`.
-   **Cascade:**
    -   Delete User record.
    -   Cascade deletes Sessions, Chapters.
    -   **Critical:** Trigger webhook to delete vectors from Pinecone.
    -   **Critical:** Trigger webhook to delete files from Blob Storage.

### **AI Transparency**
-   We explicitly disclose that the user is talking to an AI, not a human.
-   "Recording in Progress" UI is mandatory and cannot be hidden.
