import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { JobRepository } from '../../domain/repositories/JobRepository';

export class EndSessionUseCase {
  constructor(
    private sessionRepository: SessionRepository,
    private jobRepository: JobRepository
  ) {}

  async execute(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new Error('Session not found');

    // Use transaction to update status
    await this.sessionRepository.completeSessionTransaction(sessionId);

    // Queue background job for chapter generation
    // This decouples the heavy LLM process from the user interaction loop
    await this.jobRepository.create('generate_chapter', { sessionId });

    // Additional jobs could be queued here (e.g., audio processing)
  }
}
