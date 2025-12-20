import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { LLMPort } from '../ports/LLMPort';
import { VectorStorePort } from '../ports/VectorStorePort';
import { ContentSafetyGuard } from '../services/ContentSafetyGuard';

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

    // 1. Safety Check (SYS-02)
    if (speaker === 'user') {
      const user = await this.userRepository.findById(session.userId);
      const emergencyContact = user?.preferences?.emergencyContact?.email;

      await this.contentSafetyGuard.monitor(
        message,
        session.userId,
        sessionId,
        emergencyContact
      );
    }

    const transcript = JSON.parse(session.transcriptRaw || '[]');
    transcript.push({
      id: `msg-${Date.now()}`,
      speaker,
      text: message,
      timestamp: new Date().toISOString(),
    });

    if (speaker === 'user') {
      const memories = await this.vectorStore.retrieveContext(
        session.userId,
        message
      );

      // Use LLM directly instead of AIServiceBridge
      const prompt = `
            Context: ${JSON.stringify(transcript.slice(-10))}
            Memories: ${JSON.stringify(memories)}
            User: ${message}
            Generate follow up question JSON: { "text": "...", "strategy": "..." }
         `;
      let response;
      try {
        response = await this.llm.generateJson<{
          text: string;
          strategy: string;
        }>(prompt);
      } catch (e) {
        response = {
          text: 'Can you tell me more about that?',
          strategy: 'fallback',
        };
      }

      transcript.push({
        id: `msg-${Date.now() + 1}`,
        speaker: 'agent',
        text: response.text,
        timestamp: new Date().toISOString(),
        strategy: response.strategy,
      });

      // Return agent response
      session.transcriptRaw = JSON.stringify(transcript);
      await this.sessionRepository.update(session);
      return { text: response.text, strategy: response.strategy };
    }

    session.transcriptRaw = JSON.stringify(transcript);
    await this.sessionRepository.update(session);
    return null;
  }
}
