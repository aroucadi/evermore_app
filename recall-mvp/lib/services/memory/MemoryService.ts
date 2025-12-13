
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIClient } from '@/lib/services/openai/OpenAIClient';
import { db } from '@/lib/db';
import { sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Message } from '@/lib/types';

interface Memory {
  text: string;
  timestamp: string;
  entities: any;
}

export class MemoryService {
  private pinecone: Pinecone;
  private openai: OpenAIClient;
  private index: any;

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    });
    this.index = this.pinecone.index('recall-memories');
    this.openai = new OpenAIClient();
  }

  async storeConversation(sessionId: string, transcript: Message[]): Promise<void> {
    // 1. Chunk conversation (~500 tokens each)
    const chunks = this.chunkText(transcript, 500);

    // 2. Generate embeddings
    const embeddings = await this.openai.createEmbeddings(
      chunks.map(c => c.text)
    );

    // 3. Extract metadata
    const metadata = await Promise.all(
      chunks.map(c => this.extractMetadata(c.text))
    );

    // 4. Upsert to Pinecone
    const vectors = chunks.map((chunk, i) => ({
      id: `${sessionId}_chunk_${i}`,
      values: embeddings[i],
      metadata: {
        sessionId,
        userId: chunk.userId,
        text: chunk.text,
        ...metadata[i]
      }
    }));

    await this.index.upsert(vectors);
  }

  async retrieveContext(
    userId: string,
    currentTopic?: string
  ): Promise<Memory[]> {
    // 1. Get recent sessions
    const recentSessions = await db.select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(sessions.startedAt)
      .limit(2);

    const recentIds = recentSessions.map(s => s.id);
    // const recentMemories = await this.index.query({
    //   filter: { sessionId: { $in: recentIds } },
    //   topK: 10,
    //   includeMetadata: true
    // });

    // 2. If topic provided, semantic search
    let relatedMemories: any[] = [];
    if (currentTopic) {
      const embedding = await this.openai.createEmbedding(currentTopic);
      // relatedMemories = await this.index.query({
      //   vector: embedding,
      //   filter: { userId },
      //   topK: 5,
      //   includeMetadata: true
      // });
    }

    // 3. Combine and deduplicate
    const allMemories = [.../*recentMemories.matches,*/ ...relatedMemories];
    const unique = Array.from(
      new Map(allMemories.map(m => [m.id, m])).values()
    );

    return unique.map(m => ({
      text: m.metadata.text,
      timestamp: m.metadata.timestamp,
      entities: m.metadata.entities
    }));
  }

  private chunkText(transcript: Message[], tokensPerChunk: number): any[] {
    // Simple chunking (use tiktoken for accurate token count)
    const text = transcript.map(m => m.text).join(' ');
    const words = text.split(/\s+/);
    const chunks = [];

    for (let i = 0; i < words.length; i += tokensPerChunk) {
      chunks.push({
        text: words.slice(i, i + tokensPerChunk).join(' '),
        userId: 'user-id' // TODO: extract from context
      });
    }

    return chunks;
  }

  private async extractMetadata(text: string) {
    // Use GPT-4 to extract entities
    const prompt = `Extract people, places, and temporal markers from this text:
"${text}"

Return JSON: { "people": [], "places": [], "temporal_markers": [] }`;

    const response = await this.openai.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content as string);
  }
}
