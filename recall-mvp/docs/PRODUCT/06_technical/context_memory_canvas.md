# Context and Memory Canvas

> Managing finite context windows and infinite memory.

---

## Purpose

This canvas defines how Recall manages the fundamental constraint of LLM context windows while enabling persistent, growing knowledge of users. It documents the memory architecture, RAG strategy, and context engineering approaches.

---

## Problems Solved

1. **Context overflow**: LLMs have finite context windows. Without management, long conversations fail.

2. **Stateless LLMs**: Each LLM call is independent. Users expect continuity across sessions.

3. **Relevant retrieval**: Not all memories are relevant to every conversation. Retrieval must be intelligent.

4. **Priority management**: When context is scarce, the system must decide what to discard.

---

## Memory Tiers

Recall implements a four-tier memory architecture:

| Tier | Type | Persistence | Scope | Implementation |
|------|------|-------------|-------|----------------|
| **Working** | Transient | No | Single step | In-memory variables |
| **Short-Term** | Session | Session | Current conversation | `ContextBudgetManager` |
| **Semantic** | Permanent | Yes | User lifetime | Vector DB (Pinecone) |
| **Episodic** | Permanent | Yes | User lifetime | Vector DB (Pinecone) |

### Working Memory

- **What**: Variables and intermediate results during step execution
- **Lifespan**: Single step or sub-task
- **Use case**: Holding tool results before observation processing
- **Eviction**: Automatic at step completion

### Short-Term Memory

- **What**: Current conversation turns, recent context
- **Lifespan**: Current session
- **Use case**: Maintaining conversation flow, tracking what was just said
- **Eviction**: Sliding window, priority-based pruning

### Semantic Memory

- **What**: Facts about the user (names, places, preferences, relationships)
- **Lifespan**: Permanent (until user deletion)
- **Use case**: "You told me your sister's name is Mary"
- **Storage**: Vector embeddings in Pinecone
- **Schema**:
```typescript
interface SemanticMemoryEntry {
  id: string;
  userId: string;
  content: string;
  embedding: number[];
  category: 'PERSON' | 'PLACE' | 'EVENT' | 'PREFERENCE' | 'BIOGRAPHY';
  importance: 1 | 2 | 3 | 4 | 5;
  createdAt: Date;
  lastAccessedAt: Date;
}
```

### Episodic Memory

- **What**: Summaries of significant interactions and outcomes
- **Lifespan**: Permanent
- **Use case**: "In our last session, you told me about your honeymoon in Paris"
- **Storage**: Vector embeddings in Pinecone
- **Schema**:
```typescript
interface EpisodicMemoryEntry {
  id: string;
  userId: string;
  summary: string;
  embedding: number[];
  sessionId: string;
  outcome: 'SUCCESS' | 'PARTIAL' | 'INTERRUPTED';
  emotionalTone: string;
  keyTopics: string[];
  createdAt: Date;
}
```

---

## RAG Strategy

Retrieval-Augmented Generation (RAG) is executed at the start of every session and on-demand during memory lookups.

### Chunking Approach

| Content Type | Chunk Strategy |
|--------------|----------------|
| Conversation turns | Per-turn, with speaker attribution |
| Captured stories | Paragraph-level, max 500 tokens |
| User facts | Fact-level, single statements |

### Retrieval Method

**Hybrid**: Dense retrieval (primary) with metadata filtering.

```typescript
// Retrieval pipeline
async retrieveMemories(query: string, userId: string, limit: number): Promise<Memory[]> {
  // 1. Generate embedding for query
  const embedding = await this.embeddingPort.embed(query);
  
  // 2. Vector search with user filter
  const results = await this.vectorStore.query({
    vector: embedding,
    filter: { userId },
    topK: limit,
    includeMetadata: true
  });
  
  // 3. Rerank by recency and importance
  return this.rerank(results);
}
```

### Retrieval Parameters

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Top-K | 5 | Balance relevance vs. context usage |
| Similarity threshold | 0.7 | Avoid irrelevant results |
| Recency boost | 1.2x for <7 days | Recent memories more likely relevant |
| Importance boost | By importance score | High-value memories prioritized |

---

## Context Engineering

### Context Composition

The prompt is assembled from discrete sources via `ContextBudgetManager`:

| Priority | Source | Description | Prunable |
|----------|--------|-------------|----------|
| 1 | System Blueprint | Core personality, safety rules | Never |
| 2 | Wellbeing Boundaries | Active safety filters | Never |
| 3 | Instruction Augmentations | Role-specific instructions | Rarely |
| 4 | Relevant Memories | RAG-retrieved context | Yes |
| 5 | Conversation History | Recent turns | Yes |
| 6 | Task State | Current plan, observations | Yes |

### Budget Allocation

```typescript
interface ContextBudget {
  totalTokens: number;      // e.g., 8000
  reservedForOutput: number; // e.g., 1000
  allocations: {
    systemPrompt: number;   // e.g., 1000 (fixed)
    memories: number;       // e.g., 2000 (adaptive)
    history: number;        // e.g., 3000 (adaptive)
    taskState: number;      // e.g., 1000 (adaptive)
  };
}
```

### Pruning Strategy

When context exceeds budget:

1. **Prune task state**: Summarize observations, drop verbose tool outputs
2. **Prune history**: Keep first 2 + last 3 turns, summarize middle
3. **Prune memories**: Keep highest relevance, drop lowest
4. **Never prune**: System prompt, safety instructions

### Time and Date Injection

Every prompt includes:

```
Current time: [ISO timestamp]
Current date: [Day, Month Date, Year]
User timezone: [User's timezone]
```

### User Metadata Injection

When available:

```
User name: [Preferred name]
Relationship stage: [NEW | DEVELOPING | COMFORTABLE | TRUSTED]
Last session: [Time since last interaction]
```

---

## Failure Modes

### Context Overflow

| Symptom | Cause | Mitigation |
|---------|-------|------------|
| Truncated output | Total tokens exceeded model limit | Pre-flight budget check, aggressive pruning |
| Lost context | Important context pruned | Priority system ensures critical content preserved |
| Repeated content | Summarization loses detail | Configurable verbosity for summaries |

### Retrieval Hallucinations

| Symptom | Cause | Mitigation |
|---------|-------|------------|
| Agent cites non-existent memory | High similarity to unrelated content | Similarity threshold (0.7) |
| Wrong attribution | Metadata mismatch | User ID filtering at query time |
| Stale memories | Outdated information retrieved | Recency boost, importance decay |

### Memory Corruption

| Symptom | Cause | Mitigation |
|---------|-------|------------|
| Contradictory facts stored | User corrects themselves | Fact verification before storage |
| Duplicate entries | Same fact stored multiple times | Deduplication during storage |
| Personal data leakage | Multi-tenant issues | User ID isolation at all layers |

---

## Memory Learning Loop

Unlike static RAG systems, Recall proactively captures new knowledge:

```mermaid
graph LR
    Task[Task Completed] --> Analyze[Analyze Outcome]
    Analyze --> Extract[Extract New Facts]
    Extract --> Embed[Generate Embeddings]
    Embed --> Store[Upsert to Vector Store]
    Store --> Ready[Available for Future RAG]
```

### Storage Decision

Not all conversation content becomes permanent memory. Storage criteria:

| Criterion | Threshold |
|-----------|-----------|
| News value | Contains new information not already stored |
| User attribution | User stated it, not inferred |
| Importance | Above minimum importance threshold |
| Safety | Does not contain PII that shouldn't be stored |

---

## Trade-offs

| Decision | Trade-off | Rationale |
|----------|-----------|-----------|
| 5 memories per retrieval | Relevance vs. completeness | More memories = more noise |
| Priority-based pruning | Flexibility vs. predictability | Ensures safety content survives |
| Hybrid retrieval | Latency vs. precision | Metadata filtering improves relevance |
| Per-user isolation | Simplicity vs. sharing | Privacy trumps multi-user features |

---

## Why This Matters in Production

1. **Scalability**: Memory grows indefinitely. Vector DB handles scale.

2. **User trust**: Seniors feel known because Recall remembers.

3. **Cost control**: Context budgeting prevents token waste.

4. **Privacy**: Strict user isolation protects sensitive life stories.

5. **Debugging**: Clear memory tiers simplify troubleshooting.
