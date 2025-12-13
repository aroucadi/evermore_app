import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { AIServicePort } from '../ports/AIServicePort';
import { VectorStorePort } from '../ports/VectorStorePort';

export class ProcessMessageUseCase {
  constructor(
    private sessionRepository: SessionRepository,
    private aiService: AIServicePort,
    private vectorStore: VectorStorePort
  ) {}

  async execute(sessionId: string, message: string, speaker: 'user' | 'agent'): Promise<any> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new Error('Session not found');

    const transcript = JSON.parse(session.transcriptRaw || '[]');
    transcript.push({
      id: `msg-${Date.now()}`,
      speaker,
      text: message,
      timestamp: new Date().toISOString()
    });

    if (speaker === 'user') {
        const memories = await this.vectorStore.retrieveContext(session.userId, message);
        const response = await this.aiService.generateQuestion(message, transcript, memories);

        transcript.push({
            id: `msg-${Date.now() + 1}`,
            speaker: 'agent',
            text: response.text,
            timestamp: new Date().toISOString(),
            strategy: response.strategy
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
