# Clean Architecture and DDD Canvas

> How AI is wrapped in production-grade software.

---

## Purpose

This canvas documents how Recall's agentic AI is structured using Clean Architecture and Domain-Driven Design principles. It explains the separation of concerns that protects against vendor lock-in, enables testing, and ensures maintainability.

---

## Problems Solved

1. **Vendor lock-in**: Direct LLM SDK calls make switching providers expensive.

2. **Untestable AI**: AI logic mixed with infrastructure is impossible to unit test.

3. **Scattered concerns**: Business rules mixed with API calls create chaos.

4. **Dependency chaos**: Changes to one component cascade through the system.

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│                    Presentation                      │
│         (Next.js Pages, API Routes, UI)             │
├─────────────────────────────────────────────────────┤
│                  Infrastructure                      │
│    (Adapters: Google AI, Pinecone, Clerk, Neon)    │
├─────────────────────────────────────────────────────┤
│                   Application                        │
│      (Use Cases, Agent Orchestration, Services)     │
├─────────────────────────────────────────────────────┤
│                      Domain                          │
│        (Entities, Value Objects, Domain Events)     │
└─────────────────────────────────────────────────────┘
```

### Dependency Rule

Dependencies point inward. Inner layers know nothing of outer layers.

- Domain knows nothing
- Application knows Domain
- Infrastructure knows Application + Domain
- Presentation knows everything

---

## Core Domain Entities

Domain entities are AI-agnostic. They represent business concepts, not LLM abstractions.

### User

```typescript
interface User {
  id: string;
  email: string;
  role: 'senior' | 'family' | 'admin';
  preferredName?: string;
  preferences?: UserPreferences;
  seniorId?: string; // For family members
  createdAt: Date;
  updatedAt: Date;
}
```

### Session

```typescript
interface Session {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  transcriptRaw: string; // JSON array of turns
  storiesCaptured: number;
  status: 'active' | 'completed' | 'interrupted';
}
```

### Memory

```typescript
interface Memory {
  id: string;
  userId: string;
  content: string;
  type: 'semantic' | 'episodic';
  category: MemoryCategory;
  importance: 1 | 2 | 3 | 4 | 5;
  embedding?: number[];
  createdAt: Date;
  lastAccessedAt: Date;
}
```

### Story

```typescript
interface Story {
  id: string;
  userId: string;
  sessionId: string;
  title: string;
  content: string;
  topics: string[];
  emotionalTone: string;
  createdAt: Date;
}
```

---

## Use Cases (Interactors)

Use cases orchestrate domain logic. They depend on ports, not implementations.

### ProcessMessageUseCase

Handles incoming user messages through the agentic pipeline.

```typescript
class ProcessMessageUseCase {
  constructor(
    private llm: LLMPort,
    private vectorStore: VectorStorePort,
    private sessionRepo: SessionRepository,
    private memoryRepo: MemoryRepository
  ) {}

  async execute(sessionId: string, userMessage: string): Promise<AgentResponse> {
    // 1. Load session
    // 2. Build agent context
    // 3. Run agent
    // 4. Store results
    // 5. Return response
  }
}
```

### AnalyzeSessionImageUseCase

Handles image uploads for memory triggering.

### CreateSessionUseCase

Initiates a new conversation session.

### GetStoriesUseCase

Retrieves captured stories for family dashboard.

---

## Ports (Interfaces)

Ports define what the application needs from infrastructure. They are interfaces without implementations.

### LLMPort

```typescript
interface LLMPort {
  generateText(prompt: string): Promise<string>;
  generateJson<T>(prompt: string, schema?: ZodSchema): Promise<T>;
  generateStructuredOutput<T>(prompt: string, schema: ZodSchema<T>): Promise<T>;
}
```

### VectorStorePort

```typescript
interface VectorStorePort {
  upsert(entries: VectorEntry[]): Promise<void>;
  query(options: QueryOptions): Promise<VectorResult[]>;
  delete(ids: string[]): Promise<void>;
}
```

### EmbeddingPort

```typescript
interface EmbeddingPort {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}
```

### SpeechPort

```typescript
interface SpeechPort {
  speechToText(audioBuffer: Buffer): Promise<string>;
  textToSpeech(text: string, options?: TTSOptions): Promise<Buffer>;
}
```

### Repository Ports

```typescript
interface SessionRepository {
  findById(id: string): Promise<Session | null>;
  create(session: Partial<Session>): Promise<Session>;
  update(session: Session): Promise<Session>;
}

interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  update(user: User): Promise<User>;
}
```

---

## Adapters (Implementations)

Adapters implement ports for specific technologies.

### Google AI Adapter

Implements `LLMPort` and `EmbeddingPort` for Vertex AI.

```typescript
class GoogleAIAdapter implements LLMPort, EmbeddingPort {
  private client: GoogleGenerativeAI;

  async generateText(prompt: string): Promise<string> {
    const result = await this.client.generateContent(prompt);
    return result.response.text();
  }

  async embed(text: string): Promise<number[]> {
    // Embedding implementation
  }
}
```

### Pinecone Adapter

Implements `VectorStorePort`.

```typescript
class PineconeAdapter implements VectorStorePort {
  private client: Pinecone;
  private index: PineconeIndex;

  async query(options: QueryOptions): Promise<VectorResult[]> {
    const results = await this.index.query({
      vector: options.vector,
      filter: options.filter,
      topK: options.topK
    });
    return this.mapResults(results);
  }
}
```

### Neon/Drizzle Adapter

Implements repository ports for PostgreSQL.

```typescript
class DrizzleSessionRepository implements SessionRepository {
  constructor(private db: NeonDatabase) {}

  async findById(id: string): Promise<Session | null> {
    return await this.db.query.sessions.findFirst({
      where: eq(sessions.id, id)
    });
  }
}
```

### Google Cloud Speech Adapter

Implements `SpeechPort`.

---

## Why Clean Architecture for Agentic Systems

| Challenge | Solution |
|-----------|----------|
| LLM provider changes | Swap adapter, not business logic |
| Testing agent behavior | Mock LLMPort with deterministic responses |
| Multi-modal expansion | Add new ports, existing logic unchanged |
| Prompt tuning | Prompts in application layer, isolated from infra |
| Cost optimization | Router in application layer, swaps models via adapter |

---

## Directory Structure

```
lib/
├── core/
│   ├── domain/
│   │   ├── entities/         # User, Session, Memory, Story
│   │   └── value-objects/    # MemoryCategory, EmotionType
│   ├── application/
│   │   ├── agent/            # Agent orchestration
│   │   ├── ports/            # LLMPort, VectorStorePort, etc.
│   │   ├── services/         # Domain services
│   │   └── use-cases/        # ProcessMessage, CreateSession
│   └── types/                # Shared type definitions
├── infrastructure/
│   ├── ai/                   # GoogleAIAdapter
│   ├── db/                   # DrizzleAdapter, schema
│   ├── storage/              # PineconeAdapter
│   └── speech/               # GoogleSpeechAdapter
└── mocks/                    # Mock implementations for testing
```

---

## Trade-offs

| Decision | Trade-off | Rationale |
|----------|-----------|-----------|
| Port abstraction overhead | Complexity vs. flexibility | Provider changes are inevitable |
| Multiple layers | Boilerplate vs. separation | Long-term maintainability |
| No direct SDK calls | Convenience vs. testability | Testing trumps convenience |
| Repository pattern | Extra layer vs. consistency | DB migrations need isolation |

---

## Why This Matters in Production

1. **Vendor independence**: Switch from Google to OpenAI without rewriting logic.

2. **Testability**: Unit test agent behavior with mock LLMs.

3. **Team scaling**: New developers understand boundaries.

4. **Compliance**: Audit trails, data handling isolated to adapters.

5. **Evolution**: Add new capabilities (video, new LLMs) without chaos.
