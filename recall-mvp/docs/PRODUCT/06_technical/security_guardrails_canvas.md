# AI Security and Guardrails Canvas

> Preventing the agent from harming users or itself.

---

## Purpose

This canvas documents Recall's security architecture. It covers input validation, output safety, tool permissions, and the threat model. For a product serving vulnerable seniors, security is not a feature—it is a prerequisite.

---

## Problems Solved

1. **Prompt injection**: Malicious inputs hijacking agent behavior.

2. **Harmful outputs**: Agent giving dangerous advice or inappropriate content.

3. **Data leakage**: User memories exposed to wrong users or attackers.

4. **Resource exhaustion**: Runaway agents consuming infinite tokens/compute.

5. **Tool abuse**: Agents calling write tools without authorization.

---

## Input Scanning

### Prompt Injection Detection

Every user input is scanned before entering the agentic pipeline.

| Vector | Detection | Response |
|--------|-----------|----------|
| Instruction override | Pattern matching | Log, sanitize, continue |
| Role confusion | "You are now..." patterns | Reject, log security event |
| Jailbreak attempts | Known jailbreak phrases | Reject, flag account |
| System prompt extraction | "Ignore previous..." | Sanitize, continue |

### PII Detection

| PII Type | Action |
|----------|--------|
| Credit card numbers | Block storage, warn user |
| SSN patterns | Block storage, warn user |
| Medical record numbers | Block storage, allow conversation |
| Passwords | Block storage, warn user |

**Note**: Life story content inherently contains personal information (names, places). PII detection focuses on financial/identity theft vectors, not biographical content.

### Input Validation (JsonParser)

All structured inputs are validated via Zod schemas:

```typescript
const UserMessageSchema = z.object({
  content: z.string().max(10000),
  sessionId: z.string().uuid(),
  timestamp: z.string().datetime()
});
```

---

## Output Validation

### Content Safety

Every agent response passes through safety filters:

| Filter | Purpose |
|--------|---------|
| Medical advice detection | Prevent healthcare claims |
| Legal advice detection | Prevent legal guidance |
| Financial advice detection | Prevent investment recommendations |
| Harmful content filter | Block violence, self-harm |

### Hallucination Detection

| Technique | Implementation |
|-----------|----------------|
| Citation requirement | Responses must connect to retrieved memories |
| Confidence thresholds | Low-confidence claims flagged |
| Contradiction check | Compare against stored facts |

### Self-Critique Loop

The `ObservationReflector` validates responses before synthesis:

```typescript
interface ReflectionResult {
  goalAchieved: boolean;
  summary: string;
  confidence: number;
  factuallyGrounded: boolean;
  safetyCheck: 'PASS' | 'WARN' | 'FAIL';
  missingInformation?: string[];
}
```

---

## Wellbeing Guard

The `WellbeingGuard` (36KB implementation) monitors for senior-specific risks.

### Risk Categories

| Category | Severity | Example |
|----------|----------|---------|
| **CRISIS** | CRITICAL | Self-harm language |
| **SCAM** | HIGH | Requests for money, personal info |
| **DISTRESS** | MEDIUM | Extreme loneliness, cognitive confusion |
| **MEDICAL** | MEDIUM | Health questions requiring professional advice |
| **ISOLATION** | LOW | Extended periods without human contact |

### Detection Signals

```typescript
interface WellbeingAssessment {
  riskLevel: RiskSeverity;
  category: RiskCategory;
  confidence: number;
  triggers: string[];
  recommendedAction: WellbeingAction;
}
```

### Response Actions

| Severity | Action |
|----------|--------|
| CRITICAL | Immediate empathetic response, resource mention, session flagged |
| HIGH | Gentle warning, topic pivot, family notification (configurable) |
| MEDIUM | Softer approach, recommend professional help |
| LOW | Monitor, no immediate action |

---

## Tool Permission Model

### Tool Classification

| Permission Level | Tools | Authorization |
|------------------|-------|---------------|
| **READ_ONLY** | RetrieveMemoriesTool | Automatic |
| **READ_WRITE** | SaveFactTool, StoreMemoryTool | Automatic (low risk) |
| **SENSITIVE** | NotifyFamilyTool | User confirmation or policy |
| **DANGEROUS** | (None currently) | Human-in-the-loop |

### Tool Registry (ToolRegistry)

```typescript
interface ToolContract {
  name: string;
  version: string;
  description: string;
  permissionLevel: PermissionLevel;
  inputSchema: ZodSchema;
  outputSchema: ZodSchema;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  auditRequired: boolean;
}
```

### Human-in-the-Loop Policies

| Scenario | Policy |
|----------|--------|
| Family notification | Optional HITL based on settings |
| Memory deletion | Requires explicit confirmation |
| Account changes | Always requires HITL |
| Emergency contact | Auto-sends, logs for review |

---

## Graduated Autonomy

The `AutonomyControl` system adjusts agent freedom based on risk.

| Level | Risk | Behavior |
|-------|------|----------|
| **L0** | Critical | Every action requires HITL |
| **L1** | High | Agent plans, but write actions require approval |
| **L2** | Medium | Agent executes, WellbeingGuard can halt |
| **L3** | Low | Standard ReAct loop with safety filters |

**Default for seniors**: L2 (Guarded autonomy)

---

## Threat Model

### Assets to Protect

| Asset | Classification |
|-------|----------------|
| User life stories | High sensitivity |
| User identity | Critical |
| Session transcripts | High sensitivity |
| Account credentials | Critical |
| Family relationships | Medium sensitivity |

### Threat Actors

| Actor | Motivation | Capability |
|-------|------------|------------|
| Scammers | Financial exploitation | Social engineering |
| Malicious family | Access to senior data | Account access |
| Curious attackers | Data theft | Technical skills |
| Researchers | Bug discovery | Prompt manipulation |

### Attack Vectors

| Vector | Mitigation |
|--------|------------|
| Prompt injection | Input scanning, santization |
| Session hijacking | Clerk authentication, session tokens |
| Memory poisoning | User ID isolation, input validation |
| Model manipulation | Output validation, safety filters |
| Side-channel leakage | Audit logging, data isolation |

---

## Emergency Halt

The `AgentLoopMonitor` can force halt execution:

| Trigger | Action |
|---------|--------|
| Budget exceeded | Immediate halt, partial response |
| Max steps exceeded | Halt, summarize progress |
| Safety critical event | Halt, safety response |
| Supervisor rejection | Halt, escalate |
| Timeout | Halt, graceful failure |

```typescript
enum HaltReason {
  SUCCESS = 'SUCCESS',
  MAX_STEPS_REACHED = 'MAX_STEPS_REACHED',
  BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',
  TIMEOUT = 'TIMEOUT',
  SAFETY_TRIGGERED = 'SAFETY_TRIGGERED',
  ERROR = 'ERROR',
  USER_CANCELLED = 'USER_CANCELLED',
}
```

---

## Audit Trail

Every significant action is logged:

| Event | Logged Data |
|-------|-------------|
| Tool execution | Tool name, input (sanitized), output, cost |
| Safety trigger | Trigger type, severity, action taken |
| State transition | From state, to state, reason |
| Authentication | User ID, session ID, timestamp |
| Data access | Memory IDs accessed, query |

---

## Trade-offs

| Decision | Trade-off | Rationale |
|----------|-----------|-----------|
| Aggressive safety filters | Capability vs. safety | Seniors are vulnerable |
| All inputs scanned | Latency vs. security | Security is non-negotiable |
| Audit everything | Storage vs. compliance | Accountability required |
| Graduated autonomy | UX vs. control | Configurable per user |

---

## Why This Matters in Production

1. **User safety**: Seniors are protected from scams and harm.

2. **Legal compliance**: Audit trails support regulatory requirements.

3. **Trust**: Family members trust their parent is protected.

4. **Reputation**: A single safety incident could destroy the product.

5. **Scalability**: Automated safety enables growth without proportional human review.
