import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { AIServicePort } from '../ports/AIServicePort';
import { VectorStorePort } from '../ports/VectorStorePort';
import { Session } from '../../domain/entities/Session';
import { randomUUID } from 'crypto';

export class StartSessionUseCase {
  constructor(
    private sessionRepository: SessionRepository,
    private userRepository: UserRepository,
    private aiService: AIServicePort,
    private vectorStore: VectorStorePort
  ) {}

  async execute(userId: string): Promise<{ session: Session; aiConfig: any }> {
    const user = await this.userRepository.findById(userId);
    const userName = user ? user.name : "User";

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
        userName,
        memories
    );

    return { session: createdSession, aiConfig };
  }
}
