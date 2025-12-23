# Future Tech Recommendations

**Date:** 2024-12-23 (Updated)  
**Priority Framework:** Recommendations ordered by strategic impact and dependency chains.

This document outlines strategic recommendations for evolving the Recall platform beyond MVP. These are **consciously deferred** to prioritize launch velocity.

---

## Priority Matrix

| Priority | Category | Trigger for Action |
|:---:|:---|:---|
| 🔴 P0 | Security/Compliance | Legal requirement or breach |
| 🟠 P1 | Reliability | Production incidents or scale issues |
| 🟡 P2 | Developer Experience | Onboarding friction or tech debt cost |
| 🟢 P3 | Future Growth | Strategic opportunity or market pressure |

---

## 🔴 P0: Security & Compliance

### 1.1 Managed Authentication Provider
**Current State:** Custom JWT with `jose` library.  
**Risk:** Maintenance burden; security complexity for MFA/OAuth.

| Trigger | Action | Options |
|:---|:---|:---|
| Requirement for Social Login, MFA, or multi-tenancy | Migrate to managed auth | **Clerk**, Auth.js (NextAuth v5), Supabase Auth |

**Benefits:**
- Built-in MFA, session management, OAuth providers
- SOC 2 compliance documentation out-of-the-box
- Reduced attack surface

### 1.2 Full Input Validation with Zod
**Current State:** Whitelist approach for profile updates.  
**Risk:** Inconsistent validation; harder to maintain as API surface grows.

| Trigger | Action |
|:---|:---|
| Adding new API endpoints | Implement Zod schemas at all API boundaries |

```typescript
// Example migration pattern
const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
});
```

---

## 🟠 P1: Reliability & Scale

### 2.1 Asynchronous Worker Architecture
**Current State:** Next.js API Routes + Vercel Cron (60s timeout).  
**Risk:** Long-running AI jobs (book generation, video rendering) will timeout.

| Trigger | Action | Options |
|:---|:---|:---|
| Timeouts on book generation | Extract to dedicated worker | **Temporal.io**, BullMQ + Redis, Inngest |

```
┌─────────────────┐     ┌──────────────┐     ┌───────────────┐
│  Next.js API    │────▶│  Job Queue   │────▶│  Worker Pod   │
│  (Fast Insert)  │     │  (Redis)     │     │  (No Timeout) │
└─────────────────┘     └──────────────┘     └───────────────┘
```

### 2.2 Rate Limiting & Circuit Breakers
**Current State:** No rate limiting on API or AI provider calls.  
**Risk:** Cost explosion from abuse; cascading failures from provider outages.

| Trigger | Action |
|:---|:---|
| Unexplained cost spikes or provider errors | Add rate limits + circuit breakers |

**Recommended Stack:**
- `upstash/ratelimit` for edge-compatible API rate limiting
- `cockatiel` or `opossum` for circuit breaker pattern

### 2.3 Observability Platform
**Current State:** Structured JSON logs to stdout.  
**Risk:** Limited visibility into distributed traces across AI services.

| Trigger | Action | Options |
|:---|:---|:---|
| Difficulty debugging latency or silent failures | Integrate observability platform | **Datadog**, Honeycomb, OpenTelemetry + Grafana |

**Key Instrumentation Targets:**
- Agent loop execution time (`EnhancedReActAgent`)
- LLM token usage per request
- Voice provider latency (ElevenLabs vs HuggingFace)

---

## 🟡 P2: Developer Experience

### 3.1 Technology Stack Stabilization
**Current State:** Next.js 16 (Canary) + React 19.  
**Risk:** Breaking changes; limited community support for edge cases.

| Trigger | Action |
|:---|:---|
| Inexplicable rendering bugs or compiler crashes | Downgrade to Next.js 15 LTS + React 18 |

**Why Deferred:** Server Actions and the React Compiler are actively used. Migration now would destabilize launch.

### 3.2 Monorepo Tooling
**Current State:** Single package with nested lib/ structure.  
**Risk:** Build times grow; unclear dependency boundaries.

| Trigger | Action |
|:---|:---|
| Team size > 3 or build > 2 minutes | Migrate to **Turborepo** or **Nx** |

### 3.3 API Documentation (OpenAPI)
**Current State:** No formal API spec.  
**Risk:** Hard to onboard new developers; no client SDK generation.

| Trigger | Action |
|:---|:---|
| External API consumers or mobile app | Generate OpenAPI spec with `zod-to-openapi` |

---

## 🟢 P3: Future Growth

### 4.1 Multi-Modal Input Expansion
**Current State:** Voice + Image triggers.  
**Opportunity:** Video memories, document scanning, location triggers.

| Trigger | Action |
|:---|:---|
| User demand for video memories | Add video processing pipeline (FFmpeg + Gemini Vision) |

### 4.2 Personalized AI Model Fine-Tuning
**Current State:** Zero-shot prompting with Gemini/GPT.  
**Opportunity:** User-specific writing style through fine-tuning.

| Trigger | Action |
|:---|:---|
| Premium tier with personalization demand | Implement LoRA fine-tuning on user data |

### 4.3 Offline-First Mobile Architecture
**Current State:** Web-only, requires connectivity.  
**Opportunity:** Native apps with local LLM inference (MLX, llamafile).

| Trigger | Action |
|:---|:---|
| Mobile app strategic priority | Implement React Native + on-device inference |

---

## Decision Log

| Date | Decision | Rationale |
|:---|:---|:---|
| 2024-12 | Keep Next.js 16 | Server Actions flow is critical; no blockers hit |
| 2024-12 | Custom JWT over Clerk | Faster MVP iteration; migration path clear |
| 2024-12 | Whitelist over Zod | Time constraint; added to V2 roadmap |
