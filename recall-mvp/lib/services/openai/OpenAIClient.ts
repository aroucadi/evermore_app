
import OpenAI from 'openai';

export class OpenAIClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });
  }

  async complete(params: {
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    max_tokens?: number;
    response_format?: any;
  }) {
    return await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: params.messages as any,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens ?? 500,
      response_format: params.response_format
    });
  }

  async createEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });

    return response.data[0].embedding;
  }

  async createEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts
    });

    return response.data.map(d => d.embedding);
  }
}
