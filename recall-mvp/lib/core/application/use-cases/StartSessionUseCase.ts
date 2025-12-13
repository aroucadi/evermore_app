import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { AIServicePort } from '../ports/AIServicePort';
import { VectorStorePort } from '../ports/VectorStorePort';
import { Session } from '../../domain/entities/Session';
import { randomUUID } from 'crypto';

export class StartSessionUseCase {
  constructor(
    private sessionRepository: SessionRepository,
    private aiService: AIServicePort,
    private vectorStore: VectorStorePort
  ) {}

  async execute(userId: string): Promise<{ session: Session; aiConfig: any }> {
    const memories = await this.vectorStore.retrieveContext(userId);

    // Create session entity
    const session = new Session(
        randomUUID(),
        userId,
        '[]',
        'active',
        new Date()
    );

    // Save to DB
    const createdSession = await this.sessionRepository.create(session);

    // Start AI conversation
    const aiConfig = await this.aiService.startVoiceConversation(
        userId,
        createdSession.id,
        "User", // Should fetch user name
        memories
    );

    return { session: createdSession, aiConfig };
  }
}
