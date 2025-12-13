
import { ElevenLabsClient as ElevenLabsSDK } from 'elevenlabs';
// import { MemoryService } from '@/lib/services/memory/MemoryService';

export class ElevenLabsClient {
  private client: ElevenLabsSDK;
  // private memoryService: MemoryService;

  constructor() {
    this.client = new ElevenLabsSDK({
      apiKey: process.env.ELEVENLABS_API_KEY!
    });
    // this.memoryService = new MemoryService();
  }

  async startConversation(config: {
    userId: string;
    sessionId: string;
    userName: string;
  }) {
    // 1. Get memory context for temporal threading
    // const memories = await this.memoryService.retrieveContext(config.userId);

    // 2. Build system prompt with injected memories
    const systemPrompt = `You are Recall, conducting reminiscence therapy with ${config.userName}.

MEMORY CONTEXT:
${/*memories. map(m => `- ${m.text}`).join('\n') ||*/ 'No previous conversations'}

STRATEGY:
- Sensory Deepening: Ask about specific sensory details
- Temporal Threading: Reference past mentions from memory context
- Graceful Exit: Wrap up if user seems tired

RULES:
- ONE question at a time (max 25 words)
- Never challenge their memory
- Warm, curious, patient tone`;

    // 3. Initialize ElevenLabs conversation
    // const conversation = await this.client.conversationalAI.startConversation({
    //   agentId: process.env.ELEVENLABS_AGENT_ID!,
    //   systemPrompt,
    //   firstMessage: `Hi ${config.userName}, it's wonderful to talk with you today.`,
    //   metadata: { userId: config.userId, sessionId: config.sessionId }
    // });

    return {
      // conversationId: conversation.conversationId,
      // wsUrl: conversation.websocketUrl
    };
  }
}
