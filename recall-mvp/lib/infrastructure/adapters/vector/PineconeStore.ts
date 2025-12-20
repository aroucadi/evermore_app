import { VectorStorePort } from '../../../core/application/ports/VectorStorePort';
import { SessionRepository } from '../../../core/domain/repositories/SessionRepository';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';

export class PineconeStore implements VectorStorePort {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private indexName: string = 'recall-memories';
  private isMock: boolean;

  constructor(private sessionRepository: SessionRepository) {
    const pineconeKey = process.env.PINECONE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!pineconeKey || !openaiKey) {
        console.warn("PineconeStore: Missing API keys (PINECONE_API_KEY or OPENAI_API_KEY). Running in MOCK mode.");
        this.isMock = true;
    } else {
        this.isMock = false;
    }

    this.pinecone = new Pinecone({
      apiKey: pineconeKey || 'mock-key',
    });
    this.openai = new OpenAI({
      apiKey: openaiKey || 'mock-key',
    });
  }

  async storeConversation(sessionId: string, transcript: string, userId: string): Promise<void> {
      await this.storeMemoryChunk(userId, sessionId, transcript, { type: 'full_conversation' });
  }

  async storeMemoryChunk(userId: string, sessionId: string, text: string, metadata: any): Promise<void> {
    if (this.isMock) return;

    try {
        const embedding = await this.openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
            dimensions: 1536
        });

        const index = this.pinecone.index(this.indexName);
        await index.upsert([{
            id: randomUUID(),
            values: embedding.data[0].embedding,
            metadata: {
                userId,
                sessionId,
                text,
                ...metadata,
                timestamp: new Date().toISOString()
            }
        }]);
    } catch (error) {
        console.error("PineconeStore: Error storing memory chunk:", error);
    }
  }

  async retrieveContext(userId: string, currentTopic?: string): Promise<any[]> {
    const context: any[] = [];

    // 1. Load recent context (Last 2 sessions) from DB (Reliable source)
    try {
        const recentSessions = await this.sessionRepository.findLastSessions(userId, 2);
        for (const session of recentSessions) {
            if (session.transcriptRaw) {
                const transcript = typeof session.transcriptRaw === 'string'
                    ? session.transcriptRaw
                    : JSON.stringify(session.transcriptRaw);

                context.push({
                    type: 'recent_session',
                    text: `Previous session on ${session.startedAt}: ${transcript.substring(0, 500)}...`,
                    metadata: { date: session.startedAt }
                });
            }
        }
    } catch (e) {
        console.error("PineconeStore: Failed to load recent sessions:", e);
    }

    if (this.isMock) {
        // Return dummy context if mocking
        context.push({ text: "User grew up in a small town called Oakhaven.", metadata: { date: "1950s" } });
        return context;
    }

    try {
        const index = this.pinecone.index(this.indexName);

        let queryEmbedding: number[] = [];

        // If no topic provided, use a generic query to get broad context
        const queryText = currentTopic || "important life events summary childhood family career";

        const embeddingResponse = await this.openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: queryText
        });
        queryEmbedding = embeddingResponse.data[0].embedding;

        const queryResponse = await index.query({
            vector: queryEmbedding,
            topK: 5,
            filter: { userId: userId },
            includeMetadata: true
        });

        const vectorMatches = queryResponse.matches.map(match => ({
            text: match.metadata?.text,
            score: match.score,
            metadata: match.metadata
        }));

        return [...context, ...vectorMatches];

    } catch (error) {
        console.error("PineconeStore: Error retrieving context:", error);
        return context;
    }
  }
}
