import { Tool } from '../types';
import { VectorStorePort } from '../../ports/VectorStorePort';

export class RetrieveMemoriesTool implements Tool {
  name = 'RetrieveMemories';
  description = 'Search for past memories or conversations based on a query.';
  schema = {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'The search query' },
    },
    required: ['query'],
  };

  constructor(private vectorStore: VectorStorePort, private userId: string) {}

  async execute(input: any): Promise<string> {
    if (!input.query) return 'Error: Missing query.';
    try {
        // Assuming retrieveContext returns { text: string, ... }[]
        const results = await this.vectorStore.retrieveContext(this.userId, input.query);
        return JSON.stringify(results);
    } catch (e: any) {
        return `Error retrieving memories: ${e.message}`;
    }
  }
}
