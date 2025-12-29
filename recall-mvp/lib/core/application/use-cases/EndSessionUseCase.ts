import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { JobRepository } from '../../domain/repositories/JobRepository';
import { GenerateChapterUseCase } from './GenerateChapterUseCase';

export class EndSessionUseCase {
  constructor(
    private sessionRepository: SessionRepository,
    private jobRepository: JobRepository,
    private generateChapterUseCase?: GenerateChapterUseCase
  ) { }

  async execute(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new Error('Session not found');

    // Use transaction to update status
    await this.sessionRepository.completeSessionTransaction(sessionId);

    // Always queue background job for chapter generation
    // This decouples the heavy LLM process from the user interaction loop
    // and ensures Development environment mirrors Production architecture.
    await this.jobRepository.create('generate_chapter', { sessionId });
  }
}
