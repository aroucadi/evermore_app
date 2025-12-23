# Multimodal and Infrastructure Canvas

> Audio, vision, and deployment reality.

---

## Purpose

This canvas documents Recall's multimodal pipelines (voice, images) and deployment infrastructure. It covers the sensory inputs that make Recall accessible to seniors and the habitat where the system runs.

---

## Problems Solved

1. **Accessibility**: Seniors cannot type effectively. Voice is mandatory.

2. **Memory triggers**: Photos unlock memories that words alone cannot.

3. **Latency**: Slow responses break conversational flow.

4. **Scalability**: Infrastructure must handle concurrent sessions.

---

## Audio Pipelines

### Speech-to-Text (STT)

| Component | Technology | Notes |
|-----------|------------|-------|
| Provider | Google Cloud STT | High accuracy for elderly voices |
| Model | Latest long-form | Better for rambling narratives |
| Languages | English (primary) | Multi-language roadmap |
| Streaming | Supported | Real-time transcription |

#### STT Flow

```
Audio Input → Preprocessing → Google STT → Transcript → Agent
     │              │              │            │
   Buffer      Noise filter    API call    Punctuation
```

#### STT Configuration

```typescript
interface STTConfig {
  encoding: 'LINEAR16' | 'WEBM_OPUS';
  sampleRateHertz: 48000;
  languageCode: 'en-US';
  enableAutomaticPunctuation: true;
  enableSpokenPunctuation: false;
  enableSpokenEmojis: false;
  model: 'latest_long';
  useEnhanced: true;
}
```

#### Senior-Specific Considerations

| Challenge | Solution |
|-----------|----------|
| Slower speech | Extended silence detection |
| Background noise | Noise cancellation preprocessing |
| Accents | Enhanced model with accent adaptation |
| Pauses for thought | Longer utterance boundaries |

### Text-to-Speech (TTS)

| Component | Technology | Notes |
|-----------|------------|-------|
| Provider | Google Cloud TTS | Natural voices |
| Voice | Neural2 (English) | Warm, clear tone |
| Speed | 0.9x default | Slower for seniors |
| Pitch | Slightly lower | Warmth and clarity |

#### TTS Flow

```
Agent Response → Preprocessing → Google TTS → Audio Buffer → Playback
       │              │              │              │
    200 words     Chunk split    API call        Stream
```

#### TTS Configuration

```typescript
interface TTSConfig {
  languageCode: 'en-US';
  name: 'en-US-Neural2-F'; // Female voice
  ssmlGender: 'FEMALE';
  speakingRate: 0.9;
  pitch: -1.0;
  volumeGainDb: 0;
}
```

#### Emotional Adaptation

| Emotion Detected | TTS Adjustment |
|------------------|----------------|
| Sadness | Slower, softer |
| Joy | Slightly faster |
| Confusion | Slower, clearer |
| Neutral | Default settings |

---

## Vision Pipelines

### Image Analysis

| Component | Technology | Notes |
|-----------|------------|-------|
| Provider | Google Vertex AI (Gemini Vision) | Multimodal LLM |
| Input formats | JPEG, PNG, WebP | Common photo formats |
| Max size | 20MB | API limit |
| Use case | Photo-triggered storytelling |

#### Image Analysis Flow

```
Photo Upload → Validation → Resize → Gemini Vision → Story Prompt
      │            │           │           │              │
   Family      Format      Optimize    Describe     Trigger
  dashboard     check       for API    contents    conversation
```

#### Proustian Trigger Prompt

```
Analyze this photo. Describe:
1. The setting and era (if identifiable)
2. The people (ages, relationships if visible)
3. Objects that might have personal significance
4. Emotional tone of the scene

Then generate an empathetic question that might help 
an elderly person recall memories related to this image.
```

#### Image Safety

| Check | Action |
|-------|--------|
| Inappropriate content | Reject with gentle message |
| PII visible (documents) | Warn user, allow override |
| Low quality | Attempt enhancement or warn |

---

## Deployment Models

### Current Architecture

```
┌─────────────────────────────────────────────────────┐
│                      Vercel                          │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │   Next.js   │  │   API       │  │  Edge      │  │
│  │   Frontend  │  │   Routes    │  │  Functions │  │
│  └─────────────┘  └─────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────┘
           │                │                │
           ▼                ▼                ▼
┌─────────────┐  ┌─────────────────┐  ┌────────────┐
│   Clerk     │  │  Google Cloud   │  │  Pinecone  │
│   (Auth)    │  │  (AI, Speech)   │  │  (Vector)  │
└─────────────┘  └─────────────────┘  └────────────┘
                         │
                         ▼
                 ┌─────────────┐
                 │   Neon      │
                 │   (Postgres)│
                 └─────────────┘
```

### Serverless Model

| Component | Platform | Scaling |
|-----------|----------|---------|
| Frontend | Vercel Edge | Auto |
| API routes | Vercel Functions | Auto |
| Database | Neon Serverless | Auto |
| Vector DB | Pinecone Serverless | Auto |
| AI | Google Cloud | Managed |

### Container Model (Alternative)

For enterprise/on-premise:

```yaml
# docker-compose.yml structure
services:
  app:
    build: .
    ports: ["3000:3000"]
    depends_on: [db, redis]
  db:
    image: postgres:15
  redis:
    image: redis:7
```

---

## Latency Budgets

### Time-to-First-Token (TTFT)

| Component | Target | Budget |
|-----------|--------|--------|
| STT processing | <500ms | 500ms |
| Agent intent | <300ms | 300ms |
| Memory retrieval | <200ms | 200ms |
| LLM first token | <800ms | 800ms |
| **Total TTFT** | **<1.8s** | 1.8s |

### End-to-End SLA

| Metric | Target |
|--------|--------|
| P50 response time | <3s |
| P95 response time | <6s |
| P99 response time | <10s |
| Availability | 99.5% |

### Latency Optimization

| Technique | Benefit |
|-----------|---------|
| Edge deployment | Reduced network latency |
| Streaming responses | Faster perceived response |
| Parallel retrieval | RAG during intent recognition |
| Connection pooling | Reduced handshake overhead |

---

## Scalability

### Concurrent Sessions

| Tier | Concurrent Sessions | Limiting Factor |
|------|---------------------|-----------------|
| Free | 10 | Cost budget |
| Starter | 50 | Vercel limits |
| Pro | 500 | LLM rate limits |
| Enterprise | 5,000+ | Custom infrastructure |

### Rate Limits

| Resource | Limit | Window |
|----------|-------|--------|
| Sessions per user | 10 | Per hour |
| Messages per session | 100 | Per session |
| Images per day | 20 | Per user |
| API calls | 1000 | Per minute (org) |

### Horizontal Scaling

| Component | Scaling Model |
|-----------|---------------|
| Frontend | Vercel auto-scaling |
| API | Serverless auto-scaling |
| Database | Neon connection pooling |
| Vector DB | Pinecone managed |
| AI | Google Cloud managed |

---

## Reliability

### Failure Modes

| Failure | Detection | Recovery |
|---------|-----------|----------|
| LLM timeout | 10s timeout | Retry once, then fail gracefully |
| Vector DB down | Health check | Return without memories |
| STT failure | Error response | Text input fallback |
| TTS failure | Error response | Text-only response |

### Circuit Breakers

```typescript
interface CircuitBreakerConfig {
  failureThreshold: 5;      // Failures before open
  resetTimeMs: 60000;       // Time before half-open
  halfOpenRequests: 3;      // Test requests in half-open
}
```

### Graceful Degradation

| Service Down | Degraded Behavior |
|--------------|-------------------|
| Memory retrieval | Respond without context |
| Image analysis | Skip photo trigger |
| TTS | Text-only response |
| STT | Text input mode |

---

## Security Infrastructure

### Network Security

| Layer | Protection |
|-------|------------|
| CDN | DDoS protection (Vercel) |
| TLS | HTTPS everywhere |
| API | Rate limiting, auth |
| Database | VPC isolation, SSL |

### Secrets Management

| Secret | Storage |
|--------|---------|
| API keys | Environment variables |
| Database credentials | Vercel encrypted |
| Auth secrets | Clerk managed |

---

## Monitoring Infrastructure

### Health Checks

| Endpoint | Frequency | Timeout |
|----------|-----------|---------|
| `/api/health` | 30s | 5s |
| Database | 60s | 10s |
| Vector DB | 60s | 10s |

### Metrics Collection

| Metric | Collection |
|--------|------------|
| Request latency | Vercel Analytics |
| Error rates | Vercel + Custom |
| LLM costs | Custom dashboard |
| User sessions | Custom analytics |

---

## Trade-offs

| Decision | Trade-off | Rationale |
|----------|-----------|-----------|
| Serverless | Cold starts vs. ops overhead | Reduced operational burden |
| Single cloud | Flexibility vs. simplicity | Faster development |
| Neural voices | Cost vs. quality | Seniors deserve natural speech |
| Edge deployment | Complexity vs. latency | UX requires low latency |

---

## Why This Matters in Production

1. **Accessibility**: Voice-first serves seniors who cannot type.

2. **Engagement**: Photo triggers unlock deeper memories.

3. **Reliability**: Graceful degradation ensures availability.

4. **Scalability**: Serverless handles variable load.

5. **Cost efficiency**: Pay-per-use aligns with revenue.
