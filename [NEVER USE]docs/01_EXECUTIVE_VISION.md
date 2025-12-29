# 01. Executive & Product Vision

## 1.1 Product Mission & North Star

**The Problem: The Silent Extinction of Wisdom**
Every day, a generation of stories, wisdom, and family history is lost as seniors pass away without documenting their lives. This is not just a loss of data; it is a loss of identity for future generations.

**Why Existing Solutions Fail:**
1.  **Ghostwriters:** Prohibitively expensive ($5,000+) and invasive.
2.  **DIY Journals:** Require immense discipline; suffer from "blank page syndrome."
3.  **Audio Recorders:** Result in an "MP3 Graveyard"—unstructured, unsearchable hours of audio that no one listens to.
4.  **Video Calls (Zoom/FaceTime):** Ephemeral. They happen and are gone. They lack the *intent* of preservation.

**The Mission:**
To democratize the preservation of human legacy by creating "Recall," an empathetic, AI-powered active living biographer. We aim to capture, structure, and immortalize the life stories of seniors through natural, voice-first conversations anchored by visual memories.

**What "Great" Looks Like:**
"Great" is when a senior finishes a session feeling *heard* and *valued*, not tired. "Great" is when a grandchild reads a chapter 50 years from now and hears their grandparent's voice in the text. "Great" is invisible technology.

---

## 1.2 Core Principles & Philosophy

### **Design Values (Non-Negotiables)**
1.  **Zero-Friction Capture:** If it requires a keyboard, we have failed. The interface must be "Invisible." Voice is the only first-class citizen.
2.  **Empathy > Efficiency:** The AI must prioritize making the user feel safe and understood over rushing to the next question. It should handle silence, tears, and laughter with grace.
3.  **Dignity by Design:** The UI must never feel "geriatric" or condescending. It should feel premium, timeless, and respectful (Terracotta/Sand palette, serif fonts).

### **Technical Philosophy**
1.  **"Buy Intelligence, Rent Infrastructure":** We leverage state-of-the-art foundation models (Gemini, ElevenLabs) for reasoning and generation, but we own the *Context* and the *Workflow*. We do not train base models.
2.  **Dependency Inversion:** The core domain (Biographies, Stories) is sacred. It must never depend on the AI provider. If OpenAI dies, we swap the adapter. The Domain survives.
3.  **Type Safety as Documentation:** We prefer strict TypeScript types and Zod schemas over extensive comments. The code *is* the contract.
4.  **Lossy Input, Structured Output:** We accept messy, stuttering, mumbling audio (Lossy) and guarantee pristine, chronological, formatted chapters (Structured).

### **Tradeoffs Consciously Accepted**
-   **Latency vs. Quality:** We accept slightly higher latency (1-2s) in voice responses to allow for "Thinking" (Chain-of-Thought) to ensure safety and empathy, rather than instant but shallow reactions.
-   **Cost vs. Capability:** We use premium models (Gemini 1.5 Pro, ElevenLabs). We accept higher COGS per user to deliver a magical experience, rather than optimizing for cheap, robotic interactions.
-   **Strict Privacy vs. Features:** We do not train shared models on user data. This limits some "community" features but ensures trust.

---

## 1.3 Success Metrics

### **User-Level Success (The Storyteller)**
-   **"The Proust Effect":** Frequency of "I haven't thought about that in years" moments (measured via sentiment analysis).
-   **Session Completion Rate:** > 80% of started sessions result in a saved chapter.
-   **NPS:** > 70 (World Class).

### **System-Level Success**
-   **Biographer Reliability:** < 1% of generated chapters require manual "Rescue" (editing) by family members due to hallucination or incoherence.
-   **Voice Latency:** P95 < 2000ms (Total Turn-Around Time).

### **AI-Level Success**
-   **Safety:** 0 false negatives on "High Risk" topics (Self-harm, Abuse).
-   **Context Retention:** The AI successfully references a fact mentioned > 3 turns ago in 90% of relevant opportunities.
