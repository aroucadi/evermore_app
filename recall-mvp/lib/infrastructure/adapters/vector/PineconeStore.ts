import { VectorStorePort } from '../../../core/application/ports/VectorStorePort';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

export class PineconeStore implements VectorStorePort {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private indexName: string = 'recall-memories';

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || 'mock-key',
    });
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'mock-key',
    });
  }

  async storeConversation(sessionId: string, transcript: string, userId: string): Promise<void> {
    if (!process.env.PINECONE_API_KEY || !process.env.OPENAI_API_KEY) {
        console.log("Mocking vector store");
        return;
    }

    const embedding = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: transcript
    });

    const index = this.pinecone.index(this.indexName);
    await index.upsert([{
        id: `${sessionId}`,
        values: embedding.data[0].embedding,
        metadata: { userId, transcript }
    }]);
  }

  async retrieveContext(userId: string, currentTopic?: string): Promise<any[]> {
    if (!process.env.PINECONE_API_KEY || !process.env.OPENAI_API_KEY) {
        return [];
    }

    // Logic to retrieve context
    return [];
  }
}
