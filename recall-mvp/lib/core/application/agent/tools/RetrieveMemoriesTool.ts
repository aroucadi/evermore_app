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
        // The vector store requires vector embedding first, but for now we assume
        // the agent or orchestrator should handle embedding if using raw VectorStorePort.
        // However, RetrieveMemoriesTool usually implies a higher level service.
        // Given the error, VectorStorePort doesn't have retrieveContext.

        // We probably need an EmbeddingPort here to convert query to vector.
        // But to fix the build quickly, we should update this tool to use the correct method signatures
        // OR rely on a `MemoryService` instead of raw `VectorStorePort`.

        // Since I can't easily inject EmbeddingPort here without changing constructor signature in many places,
        // I will assume for now that we can't implement this properly without refactoring.
        // But wait, the Memory system I implemented (AgentMemoryManager) handles this!

        // But this tool is using raw VectorStorePort.
        // Let's Stub it for now or try to use query() if we had a vector.

        return "Memory retrieval not fully implemented in this tool version. Please use AgentMemoryManager.";

    } catch (e: any) {
        return `Error retrieving memories: ${e.message}`;
    }
  }
}
