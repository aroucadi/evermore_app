import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { SessionGoalArchitect } from '../services/SessionGoalArchitect';
import { VectorStorePort } from '../ports/VectorStorePort';
import { Session } from '../../domain/entities/Session';
import { randomUUID } from 'crypto';

export class StartSessionUseCase {
  constructor(
    private sessionRepository: SessionRepository,
    private userRepository: UserRepository,
    private sessionGoalArchitect: SessionGoalArchitect,
    private vectorStore: VectorStorePort
  ) {}

  async execute(userId: string): Promise<{ session: Session; aiConfig: any }> {
    const user = await this.userRepository.findById(userId);
    const userName = user ? user.name : 'User';

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

    // Parse preferences
    let topicsAvoid: string[] = [];
    let topicsLove: string[] = [];

    if (user && user.preferences) {
      try {
        const prefs =
          typeof user.preferences === 'string'
            ? JSON.parse(user.preferences)
            : user.preferences;
        if (prefs.topicsAvoid) topicsAvoid = prefs.topicsAvoid;
        if (prefs.topicsLove) topicsLove = prefs.topicsLove;
      } catch (e) {
        console.warn('Failed to parse user preferences');
      }
    }

    // Start AI conversation via Architect (who orchestrates VoiceAgent)
    const aiConfig = await this.sessionGoalArchitect.determineSessionGoal({
      userId,
      sessionId: createdSession.id,
      userName,
      memories,
      topicsAvoid,
      topicsLove,
    });

    return { session: createdSession, aiConfig };
  }
}
