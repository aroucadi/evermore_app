# 06a. Agentic AI & Prompt Engineering

## 3.1 Agent Roles & Responsibilities

The Recall AI system is not a single "Chatbot". It is a **Multi-Agent System (MAS)** where specialized agents handle different cognitive loads.

### **The Architecture: ReAct + AoT**
We combine **ReAct** (Reasoning + Acting) for dynamic conversation with **AoT** (Algorithm of Thoughts) for complex planning and offline content generation.

#### **1. The Director (Conversational Agent)**
-   **Type:** ReAct Agent.
-   **Responsibility:** Manages the voice session in real-time.
-   **Autonomy:** High. Can decide to "Probe", "Pivot", or "Console" based on user emotion.
-   **Tools:**
    -   `RetrieveMemoriesTool`: Searches Vector DB.
    -   `CheckSafetyTool`: Analyzes risk.
    -   `SaveFactTool`: Extracts and persists a key fact immediately.
-   **Latency Budget:** < 2s.

#### **2. The Biographer (Offline Agent)**
-   **Type:** AoT Workflow (DAG - Directed Acyclic Graph).
-   **Responsibility:** Converting raw, messy transcripts into polished chapters.
-   **Autonomy:** Low (Deterministic). Follows a strict multi-phase pipeline.
-   **No Tools:** Pure function `Transcript -> Chapter`.

---

## 3.2 Reasoning Strategies

### **ReAct (Reason + Act)**
Used by the Director.
-   **Loop:** `Input` -> `Thought` -> `Action (Tool Call)` -> `Observation (Tool Output)` -> `Thought` -> `Final Answer`.
-   **Why:** Allows the AI to "Check its memory" before speaking.
-   **Example:**
    -   *User:* "It was just like that trip to Paris."
    -   *Thought:* "User referenced 'trip to Paris'. I don't recall details. I should search."
    -   *Action:* `RetrieveMemories("Paris trip")`
    -   *Observation:* "Found memory: User went to Paris in 1998 with wife Martha."
    -   *Final Answer:* "Ah, the 1998 trip with Martha? How does this compare?"

### **AoT (Algorithm of Thoughts)**
Used by the Biographer.
-   **Concept:** Decompose a complex task (writing a biography) into atomic sub-tasks (Thought Atoms) and synthesize them.
-   **Steps:**
    1.  **Atom 1 (Narrative):** "What is the plot?"
    2.  **Atom 2 (Sensory):** "What are the smells/sounds?"
    3.  **Atom 3 (Quotes):** "What are the best quotes?"
    4.  **Synthesis:** Combine Atoms 1+2+3 into a Chapter.
-   **Why:** Reduces hallucination. The "Writer" is forced to use *only* the extracted Atoms, not the raw text.

---

## 3.3 Context Engineering

### **Context Sources**
1.  **Short-Term Memory:** Last 10 turns of the current session. (In-Prompt).
2.  **Long-Term Memory:** Semantic search (Pinecone) over all past sessions.
3.  **User Profile:** `topics_loved`, `topics_avoided`, `family_names` (Injected into System Prompt).
4.  **Session Goal:** The "Mission" for this specific talk (e.g., "Discuss Early Career").

### **Context Window Strategy**
We utilize Gemini's **1M+ Token Window** to our advantage.
-   **Strategy:** "The Rolling Context".
-   Instead of aggressive summarization (which loses detail), we keep the *full raw transcripts* of the last 3 sessions in context.
-   RAG is used only for *older* memories (> 3 sessions ago).

---

## 3.4 Prompt Taxonomy

All prompts are stored in `lib/core/application/agent/prompts/`.

### **System Prompts**
-   **Purpose:** Define the Persona and Constraints.
-   **Example:** "You are Recall, an empathetic biographer. You prioritize listening over speaking. Never interrupt."
-   **Failure Case:** If too long, the model "forgets" instructions in the middle. We use "Sandwich Prompting" (Instructions -> Context -> Instructions) to mitigate.

### **Task Prompts (One-Shot)**
-   **Purpose:** Specific jobs like "Extract Entities".
-   **Structure:**
    1.  Task Description.
    2.  Input Data.
    3.  Output Schema (JSON).
    4.  **One-Shot Example** (Input -> Correct Output).

### **Safety Prompts**
-   **Purpose:** Guardrails.
-   **Structure:** "Analyze this text. If it contains self-harm, output RISK_HIGH. Otherwise, output RISK_NONE."

---

## 3.5 Code Reference
-   **ReAct Implementation:** `lib/core/application/agent/ReActAgent.ts`
-   **Planner:** `lib/core/application/agent/AgentPlanner.ts`
-   **System Prompts:** `lib/core/application/agent/prompts/SystemPrompts.ts`
