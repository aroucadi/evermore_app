# LLM FinOps Canvas

> Cost control and economic sustainability.

---

## Purpose

This canvas documents how Recall manages LLM costs. AI is expensive. Without explicit FinOps, costs spiral and margins evaporate. This canvas turns a demo into a viable product.

---

## Problems Solved

1. **Unpredictable costs**: LLM pricing is complex. Without tracking, bills surprise.

2. **Runaway agents**: Loops can consume infinite tokens without bounds.

3. **Wrong model selection**: Using expensive models for simple tasks wastes money.

4. **No unit economics**: Without per-session costs, pricing is guesswork.

---

## Model Routing Strategy

### ModelRouter

The `ModelRouter` selects models based on task complexity and budget:

```typescript
enum TaskComplexity {
  CLASSIFICATION,     // Simple intent detection
  EXTRACTION,         // Entity extraction
  REASONING,          // Complex multi-step reasoning
  CREATIVE,           // Story synthesis
  SAFETY_CRITICAL,    // Wellbeing checks
  FORMATTING,         // Text transformation
  SUMMARIZATION,      // Compression
}

enum ModelTier {
  FLASH,              // Fast, cheap, lower quality
  STANDARD,           // Balanced
  PRO,                // High quality, higher cost
  ULTRA,              // Maximum quality
}
```

### Routing Logic

```typescript
route(task: TaskComplexity, budget: RoutingBudget): RoutingDecision {
  // 1. If budget < 5 cents remaining, force FLASH tier
  // 2. Filter models by minimum quality threshold
  // 3. Score by quality / cost ratio
  // 4. Select best within budget
}
```

### Model Configuration

| Model | Tier | Cost/1K Input | Cost/1K Output | Use Cases |
|-------|------|---------------|----------------|-----------|
| gemini-1.5-flash | FLASH | $0.00001 | $0.00002 | Classification, formatting |
| gemini-1.5-pro | PRO | $0.00125 | $0.00375 | Reasoning, creative |
| gemini-1.0-pro | STANDARD | $0.0005 | $0.0015 | General use |

### Task-to-Model Mapping

| Task | Preferred Tier | Fallback |
|------|----------------|----------|
| Intent recognition | FLASH | STANDARD |
| Task decomposition | STANDARD | PRO |
| Plan generation | STANDARD | PRO |
| Tool reasoning | FLASH | STANDARD |
| Safety check | PRO (accuracy critical) | PRO |
| Response synthesis | STANDARD | FLASH |

---

## Token Economics

### Cost Per Session

| Phase | Avg Tokens | Model | Est. Cost |
|-------|------------|-------|-----------|
| Intent | 500 | FLASH | $0.0001 |
| Planning | 800 | STANDARD | $0.0012 |
| Execution (2 steps avg) | 1,200 | FLASH | $0.0003 |
| Reflection | 600 | STANDARD | $0.0009 |
| Synthesis | 400 | STANDARD | $0.0006 |
| **Total** | **3,500** | Mixed | **$0.003** |

### Value Per Session

| Metric | Value | Calculation |
|--------|-------|-------------|
| Revenue per session | $0.50 | $20/month ÷ ~40 sessions |
| Cost per session | $0.003 | Token cost |
| **Gross margin** | **99.4%** | On AI alone |

### Session Budget

| Budget Component | Default |
|------------------|---------|
| Max tokens | 8,000 |
| Max cost (cents) | 20 |
| Max steps | 5 |
| Timeout | 30 seconds |

---

## Caching Strategy

### Semantic Caching

Recall caches embeddings to avoid redundant API calls:

```typescript
class EmbeddingCache {
  private cache: LRUCache<string, number[]>;
  
  async embed(text: string): Promise<number[]> {
    const cacheKey = this.hash(text);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    const embedding = await this.embedder.embed(text);
    this.cache.set(cacheKey, embedding);
    return embedding;
  }
}
```

### Cache Benefits

| Cache Type | Hit Rate Target | Cost Reduction |
|------------|-----------------|----------------|
| Embedding cache | >60% | 60% of embedding costs |
| Prompt prefix cache | Varies | LLM-side optimization |

### Cache Invalidation

| Event | Action |
|-------|--------|
| New memory stored | No invalidation (additive) |
| Memory deleted | Evict related entries |
| Cache TTL exceeded | Evict expired entries |
| Cache size exceeded | LRU eviction |

### Stable Prefix Optimization

System prompts are structured to enable LLM-side caching:

```
[STABLE PREFIX - rarely changes]
System prompt, persona, safety rules

[DYNAMIC SUFFIX - changes per request]
Memories, conversation, task state
```

---

## Budget Guards

### AgentLoopMonitor Limits

```typescript
interface MonitorConfig {
  maxSteps: 5,           // Prevent infinite loops
  maxTimeMs: 30000,      // 30 second timeout
  maxTokens: 8000,       // Token budget
  maxCostCents: 20,      // Hard cost cap
  maxReplanAttempts: 2,  // Limit replanning
}
```

### Budget Checking

Before each step:

```typescript
function canProceed(monitor: AgentLoopMonitor): boolean {
  if (monitor.metrics.costCents >= monitor.config.maxCostCents) {
    monitor.halt(HaltReason.BUDGET_EXCEEDED);
    return false;
  }
  // Check other limits...
  return true;
}
```

### Graceful Degradation

When approaching limits:

| Remaining Budget | Action |
|------------------|--------|
| >50% | Normal operation |
| 25-50% | Switch to FLASH tier models |
| 10-25% | Reduce max remaining steps |
| <10% | Single final synthesis step |

---

## Cost Tracking

### Per-Session Tracking

```typescript
interface SessionCostReport {
  sessionId: string;
  totalCostCents: number;
  breakdown: {
    byPhase: Record<AgentPhase, number>;
    byModel: Record<string, number>;
    byTool: Record<string, number>;
  };
  tokenBreakdown: {
    input: number;
    output: number;
  };
}
```

### Daily Aggregation

| Metric | Tracking |
|--------|----------|
| Total daily cost | Sum all sessions |
| Average session cost | Running average |
| P95 session cost | Track outliers |
| By-user cost | For anomaly detection |

### Anomaly Detection

| Anomaly | Threshold | Action |
|---------|-----------|--------|
| High-cost session | >$0.50 | Log warning |
| High-cost user | >$5/day | Rate limit |
| Spike detection | >3x daily average | Alert |

---

## Fail-safes

### Circuit Breakers

| Trigger | Action |
|---------|--------|
| LLM errors > 10% | Fallback to cheaper model |
| Latency > 10s | Timeout, partial response |
| Cost > daily budget | Disable new sessions |

### Fallback Responses

When budget exhausted:

```
"I've gathered some thoughts, but I need to pause here for now. 
Let me summarize what we've discussed: [summary of observations so far]"
```

### Emergency Limits

| Limit | Value | Purpose |
|-------|-------|---------|
| Daily org budget | $100 | Prevent catastrophic overspend |
| Per-user daily limit | $5 | Prevent abuse |
| Per-session hard cap | $0.20 | Prevent runaway sessions |

---

## Cost Optimization Roadmap

| Optimization | Status | Impact |
|--------------|--------|--------|
| Model routing | Implemented | 40% cost reduction |
| Embedding cache | Implemented | 60% embedding cost reduction |
| Prompt prefix caching | Partial | 20% inference reduction |
| Batch embedding | Planned | 30% embedding reduction |
| Fine-tuned small model | Future | 70% cost on simple tasks |

---

## Trade-offs

| Decision | Trade-off | Rationale |
|----------|-----------|-----------|
| FLASH for classification | Quality vs. cost | Intent detection is low-risk |
| PRO for safety | Cost vs. accuracy | Safety errors are expensive |
| 20-cent session cap | Flexibility vs. control | Predictable unit economics |
| LRU cache eviction | Memory vs. hit rate | Bounded memory usage |

---

## Why This Matters in Production

1. **Unit economics**: Know exactly what each session costs.

2. **Predictable margins**: Price subscription with confidence.

3. **Abuse prevention**: Rate limits prevent cost explosion.

4. **Quality alignment**: Expensive models where they matter.

5. **Sustainable scaling**: Costs scale linearly with usage.
