# Observability and Evaluation Canvas

> Debugging non-deterministic systems.

---

## Purpose

This canvas documents how Recall makes agent behavior observable and evaluable. LLMs are non-deterministic. Without observability, debugging is impossible, and without evaluation, quality is unmeasurable.

---

## Problems Solved

1. **Invisible reasoning**: Without tracing, agent "thought" is a black box.

2. **Unexplained costs**: Token usage without breakdown makes cost control impossible.

3. **Unmeasurable quality**: Without evaluation, improvements are guesses.

4. **Incident response**: Without logs, production issues are undiagnosable.

---

## Tracing Strategy

### Trace Structure

Every agent run produces a structured trace:

```typescript
interface AgentTrace {
  traceId: string;
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  spans: TraceSpan[];
  metrics: TraceMetrics;
  outcome: 'SUCCESS' | 'HALTED' | 'ERROR';
}
```

### Span Hierarchy

```
Agent Run
├── Intent Recognition
│   └── LLM Call (intent classification)
├── Task Decomposition
│   └── LLM Call (decomposition)
├── Planning
│   └── LLM Call (plan generation)
├── Execution (repeated)
│   ├── Tool: RetrieveMemoriesTool
│   ├── LLM Call (reasoning)
│   └── Observation Processing
├── Reflection
│   └── LLM Call (evaluation)
└── Synthesis
    └── LLM Call (response generation)
```

### EnhancedAgentTracer

The `EnhancedAgentTracer` (18KB implementation) captures:

```typescript
interface TraceSpan {
  spanId: string;
  parentSpanId?: string;
  name: string;
  phase: AgentPhase;
  startTime: number;
  endTime: number;
  inputTokens?: number;
  outputTokens?: number;
  costCents?: number;
  model?: string;
  toolName?: string;
  input?: unknown; // Sanitized
  output?: unknown; // Truncated
  error?: string;
  metadata: Record<string, unknown>;
}
```

---

## LLM Call Instrumentation

Every LLM call captures:

| Metric | Description |
|--------|-------------|
| `inputTokens` | Tokens in prompt |
| `outputTokens` | Tokens in response |
| `model` | Model ID used |
| `latencyMs` | Time to first token + completion |
| `costCents` | Calculated cost |
| `success` | Whether call completed |
| `error` | Error message if failed |

### Cost Tracking

```typescript
interface CostBreakdown {
  totalCents: number;
  byPhase: Record<AgentPhase, number>;
  byModel: Record<string, number>;
  byTool: Record<string, number>;
}
```

### Token Tracking

```typescript
interface TokenBreakdown {
  total: number;
  input: number;
  output: number;
  byPhase: Record<AgentPhase, { input: number; output: number }>;
}
```

---

## AgentLoopMonitor

The `AgentLoopMonitor` tracks execution in real-time:

### Metrics Tracked

| Metric | Type | Limit Check |
|--------|------|-------------|
| Step count | Counter | Max steps |
| Input tokens | Counter | Token budget |
| Output tokens | Counter | Token budget |
| Cost (cents) | Counter | Cost budget |
| Elapsed time | Timer | Timeout |
| Replan count | Counter | Max replans |

### Limit Enforcement

```typescript
interface MonitorConfig {
  maxSteps: number;        // Default: 5
  maxTimeMs: number;       // Default: 30000
  maxTokens: number;       // Default: 8000
  maxCostCents: number;    // Default: 20
  maxReplanAttempts: number; // Default: 2
}
```

### Warning System

Before hitting hard limits, warnings are emitted:

```typescript
interface MonitorWarning {
  type: 'steps' | 'time' | 'tokens' | 'cost';
  percentage: number;
  current: number;
  max: number;
  message: string;
}
```

---

## Evaluation Strategy

### Quality Dimensions

| Dimension | Definition | Measurement |
|-----------|------------|-------------|
| **Faithfulness** | Response grounded in retrieved context | Automated citation check |
| **Relevance** | Response addresses user's goal | LLM judge + human review |
| **Empathy** | Tone appropriate for senior audience | Sentiment analysis + human review |
| **Safety** | No harmful advice or content | Rule-based + LLM safety check |
| **Accuracy** | Facts match stored memories | Retrieval-based verification |

### Evaluation Methods

| Method | Use Case |
|--------|----------|
| Automated rules | Safety, format, length |
| LLM-as-judge | Relevance, empathy, quality |
| Human evaluation | Golden set verification |
| User feedback | Real-world quality signal |

### Golden Dataset

```
tests/golden-datasets/
├── greetings.json
├── memory_recall.json
├── story_sharing.json
├── emotional_moments.json
├── safety_scenarios.json
└── edge_cases.json
```

Each golden example:

```typescript
interface GoldenExample {
  id: string;
  category: string;
  input: string;
  context: AgentContext;
  expectedContains: string[];
  expectedNotContains: string[];
  qualityThreshold: number;
}
```

### Eval Script

```bash
npx tsx scripts/run-eval.ts
```

Runs all golden examples, reports:
- Pass/fail per example
- Quality scores per dimension
- Regression detection

---

## Logging Policy

### What Is Logged

| Log Category | Contents | Retention |
|--------------|----------|-----------|
| Trace events | Span data, metrics, outcomes | 30 days |
| Safety events | Triggers, severity, actions | 1 year |
| Error events | Stack traces, context | 30 days |
| Audit events | Tool calls, data access | 1 year |
| Cost events | Daily/session cost summaries | 1 year |

### What Is Redacted

| Data Type | Redaction |
|-----------|-----------|
| Full prompts | Truncated to 500 chars |
| Full responses | Truncated to 500 chars |
| User PII | Masked in logs |
| API keys | Never logged |
| Session auth tokens | Hashed only |

### Log Levels

| Level | Use |
|-------|-----|
| DEBUG | Development only, full context |
| INFO | Normal operations |
| WARN | Approaching limits, degraded state |
| ERROR | Failures requiring attention |
| SECURITY | Safety triggers, auth failures |

---

## Dashboards

### Operational Dashboard

| Panel | Metrics |
|-------|---------|
| Active sessions | Count, by status |
| Session duration | P50, P95, P99 |
| Agent success rate | By outcome type |
| Error rate | By error category |

### Cost Dashboard

| Panel | Metrics |
|-------|---------|
| Daily cost | Total, by model |
| Cost per session | Average, P95 |
| Token usage | Input vs. output |
| Budget utilization | % of daily budget |

### Quality Dashboard

| Panel | Metrics |
|-------|---------|
| Eval scores | By dimension |
| Safety events | By severity |
| User satisfaction | From feedback |
| Regression alerts | Golden set failures |

---

## Alerting

| Alert | Condition | Action |
|-------|-----------|--------|
| Safety critical | Any CRITICAL trigger | PagerDuty, immediate review |
| Error spike | >5% error rate | Slack, on-call review |
| Cost spike | >150% daily average | Slack, budget review |
| Latency spike | P95 >10s | Slack, performance review |
| Eval regression | Golden set failure | Block deploy, review |

---

## Trade-offs

| Decision | Trade-off | Rationale |
|----------|-----------|-----------|
| Full span tracing | Storage vs. debuggability | Debugging non-deterministic systems requires detail |
| Log truncation | Completeness vs. privacy | Privacy and storage constraints |
| LLM-as-judge | Cost vs. scalability | Scales better than human review |
| 30-day trace retention | Storage vs. history | Balance cost and compliance |

---

## Why This Matters in Production

1. **Debugging**: When a senior reports a problem, trace provides full context.

2. **Cost visibility**: Understand exactly where tokens go.

3. **Quality assurance**: Catch regressions before users do.

4. **Compliance**: Audit trails for regulatory requirements.

5. **Improvement**: Data-driven prompt and model optimization.
