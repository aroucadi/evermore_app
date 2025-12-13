import { VectorStorePort } from '../../../core/application/ports/VectorStorePort';
import { SessionRepository } from '../../../core/domain/repositories/SessionRepository';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';

export class PineconeStore implements VectorStorePort {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private indexName: string = 'recall-memories';

  constructor(private sessionRepository: SessionRepository) {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || 'mock-key',
    });
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'mock-key',
    });
  }

  async storeConversation(sessionId: string, transcript: string, userId: string): Promise<void> {
      // Original method - maybe keeping for backward compat or updating to use chunking
      await this.storeMemoryChunk(userId, sessionId, transcript, { type: 'full_conversation' });
  }

  async storeMemoryChunk(userId: string, sessionId: string, text: string, metadata: any): Promise<void> {
    if (!process.env.PINECONE_API_KEY || !process.env.OPENAI_API_KEY) {
        console.log("Mocking vector store - storeMemoryChunk");
        return;
    }

    try {
        const embedding = await this.openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
            dimensions: 1536 // Explicitly set or use 384 as per spec if model supports it (text-embedding-3-small allows shortening but standard is 1536)
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
        console.error("Error storing memory chunk:", error);
    }
  }

  async retrieveContext(userId: string, currentTopic?: string): Promise<any[]> {
    const context: any[] = [];

    // 1. Load recent context (Last 2 sessions)
    // We append this even if we are mocking or if topic search fails
    try {
        const recentSessions = await this.sessionRepository.findLastSessions(userId, 2);
        for (const session of recentSessions) {
            if (session.transcriptRaw) {
                // Parse transcriptRaw if it's JSON, or use as is
                let transcript = session.transcriptRaw;
                // Just add a summary/indication marker
                context.push({
                    type: 'recent_session',
                    text: `Previous session on ${session.startedAt}: ${transcript.substring(0, 500)}...`,
                    metadata: { date: session.startedAt }
                });
            }
        }
    } catch (e) {
        console.error("Failed to load recent sessions:", e);
    }

    if (!process.env.PINECONE_API_KEY || !process.env.OPENAI_API_KEY) {
        context.push({ text: "This is a mock memory about childhood.", metadata: { date: "1950s" } });
        return context;
    }

    try {
        const index = this.pinecone.index(this.indexName);

        let queryEmbedding: number[] = [];

        if (currentTopic) {
             const embeddingResponse = await this.openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: currentTopic
            });
            queryEmbedding = embeddingResponse.data[0].embedding;
        } else {
             const embeddingResponse = await this.openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: "important life events and summary"
            });
            queryEmbedding = embeddingResponse.data[0].embedding;
        }

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
        console.error("Error retrieving context:", error);
        return context;
    }
  }
}
