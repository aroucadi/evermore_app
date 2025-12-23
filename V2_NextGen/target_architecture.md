# Ultimate Architecture Target — Recall

## One-Line Vision

Recall is a **decentralized, event-driven, agentic system** where autonomous Node workers react to real-world events, orchestrate intelligence, and evolve safely without breaking core flows.

This is not a CRUD app.  
This is a **reactive intelligence system**.

---

## Core Architectural Goal

Build a **Node-based decentralized worker architecture** that:

- Is **event-driven by design**
- Supports **agentic multi-step reasoning**
- Separates **orchestration from reaction**
- Scales intelligence without coupling
- Preserves determinism where users wait
- Enables experimentation without production risk

---

## Fundamental Principles

### 1. Event-Driven First (Domain Events)

Everything meaningful in Recall is expressed as a **domain event**.

Examples:
- `SpeechCaptured`
- `TranscriptionCompleted`
- `IntentIdentified`
- `MemoryRetrieved`
- `InsightGenerated`
- `ActionSuggested`
- `UserAcceptedAction`

Events are:
- Immutable
- Explicitly named
- Semantically meaningful
- Traceable end-to-end

Events describe **what happened**, not **what to do**.

---

### 2. Decentralized Node Workers

Recall runs as a **mesh of Node workers**, each with a single responsibility:

- Speech processing worker
- Transcription worker
- Intent analysis worker
- Memory retrieval worker
- Insight synthesis worker
- Action execution worker

Workers:
- Subscribe to events
- React independently
- Can be scaled horizontally
- Can be replaced without cascading failures

No worker “owns the system”.
The system emerges from reactions.

---

### 3. Orchestration ≠ Reaction

Two execution modes must coexist:

#### Orchestrated Flows (Critical Path)
- User-facing
- Deterministic
- Synchronous or bounded-async
- Example:
  - Speech → understanding → response

#### Reactive Flows (Intelligence & Enrichment)
- Non-blocking
- Asynchronous
- Event-triggered
- Example:
  - Logging
  - Memory enrichment
  - Insight generation
  - Suggestions

Orchestration ensures reliability.
Events enable evolution.

---

### 4. Agentic Architecture (Real-World AI Systems)

Agents are **event-reactive entities**, not monoliths.

Each agent:
- Has a narrow capability
- Reacts to specific events
- Produces new events
- Never assumes global state

Agent types:
- Reasoning agents
- Memory agents
- Evaluation agents
- Action agents
- UX adaptation agents

This enables:
- Multi-step reasoning
- Chain-of-thought isolation
- Parallel intelligence
- Safe agent experimentation

---

### 5. Event-Driven ≠ Infrastructure Heavy

Event-driven is a **mental model first**, infrastructure second.

Initial implementation can be:
- In-process event bus
- Typed event contracts
- Explicit event logging
- Trace correlation IDs

Infrastructure (Kafka, Pub/Sub, etc.) is optional and deferred.

Correct semantics come before scalability.

---

### 6. Determinism Where It Matters

Not everything should be async.

Rules:
- User waits → orchestrated
- User does not wait → event-driven
- Metrics, insights, enrichment → reactive
- Answers, confirmations → deterministic

This prevents:
- Flaky UX
- Untraceable failures
- AI hallucination cascades

---

### 7. Observability & Truth

Every event must be:
- Logged
- Correlated
- Explainable

If an agent makes a decision:
- The triggering event is known
- The context is explicit
- The reasoning step is traceable

No silent intelligence.
No hidden behavior.

---

## Technology Direction (Non-Binding)

- Runtime: **Node.js (TypeScript-first)**
- Architecture: Worker-based, message-driven
- AI: Agentic workflows (ReAct / CoT / AoT patterns)
- State: Event-sourced thinking (not mandatory implementation)
- Evolution path: From sync → hybrid → distributed

No premature infra.
No dogma.
Only correctness and clarity.

---

## Final Truth

Recall is not a backend.

It is a **living system of reactions**.

Event-driven architecture is not an optimization —  
it is the only model that scales **intelligence, safety, and evolution** together.

This document defines the **destination**, not the immediate roadmap.
Keep it as the architectural north star.
