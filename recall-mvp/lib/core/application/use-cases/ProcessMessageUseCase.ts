import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { LLMPort } from '../ports/LLMPort';
import { VectorStorePort } from '../ports/VectorStorePort';
import { ContentSafetyGuard } from '../services/ContentSafetyGuard';
import { ReActAgent } from '../agent/ReActAgent';
import { AgentTracer } from '../agent/AgentTracer';
import { CONVERSATIONAL_AGENT_SYSTEM_PROMPT } from '../agent/prompts/SystemPrompts';
import { RetrieveMemoriesTool } from '../agent/tools/RetrieveMemoriesTool';
import { CheckSafetyTool } from '../agent/tools/CheckSafetyTool';

export class ProcessMessageUseCase {
  constructor(
    private sessionRepository: SessionRepository,
    private userRepository: UserRepository,
    private llm: LLMPort,
    private vectorStore: VectorStorePort,
    private contentSafetyGuard: ContentSafetyGuard
  ) {}

  async execute(
    sessionId: string,
    message: string,
    speaker: 'user' | 'agent'
  ): Promise<any> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new Error('Session not found');

    const transcript = JSON.parse(session.transcriptRaw || '[]');
    transcript.push({
      id: `msg-${Date.now()}`,
      speaker,
      text: message,
      timestamp: new Date().toISOString(),
    });

    // Save user message first
    session.transcriptRaw = JSON.stringify(transcript);
    await this.sessionRepository.update(session);

    if (speaker === 'user') {
      const user = await this.userRepository.findById(session.userId);
      const emergencyContact = user?.preferences?.emergencyContact?.email;

      // Fast check
      const isRisky = await this.contentSafetyGuard.monitor(
          message, session.userId, sessionId, emergencyContact
      );
      if (isRisky) {
          return { text: "I'm concerned about what you just said. I've notified someone who can help.", strategy: "safety_intervention" };
      }

      const tracer = new AgentTracer(sessionId);

      const tools = [
          new RetrieveMemoriesTool(this.vectorStore, session.userId),
          new CheckSafetyTool(this.contentSafetyGuard, session.userId, sessionId, emergencyContact)
      ];

      const agent = new ReActAgent(this.llm, tools, CONVERSATIONAL_AGENT_SYSTEM_PROMPT);

      const context = {
          userId: session.userId,
          sessionId: sessionId,
          memories: [], // Agent will fetch if needed
          recentHistory: transcript.slice(-10)
      };

      const result = await agent.run(`User said: "${message}". Respond appropriately.`, context, tracer);

      // Persist Trace (Console for now)
      // console.log(JSON.stringify(tracer.getTrace(), null, 2));

      const responseText = result.success ? result.finalAnswer : "I'm listening. Please go on.";

      transcript.push({
        id: `msg-${Date.now() + 1}`,
        speaker: 'agent',
        text: responseText,
        timestamp: new Date().toISOString(),
        strategy: 'agentic',
        metadata: {
            traceId: sessionId,
            reasoning: result.steps.map(s => s.thought).join(' -> ')
        }
      });

      session.transcriptRaw = JSON.stringify(transcript);
      await this.sessionRepository.update(session);

      return { text: responseText, strategy: 'agentic' };
    }

    return null;
  }
}
