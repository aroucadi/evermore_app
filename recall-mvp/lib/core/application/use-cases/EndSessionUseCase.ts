import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { GenerateChapterUseCase } from './GenerateChapterUseCase';

export class EndSessionUseCase {
  constructor(
    private sessionRepository: SessionRepository,
    private generateChapterUseCase: GenerateChapterUseCase
  ) {}

  async execute(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new Error('Session not found');

    // Use transaction to update status and queue job
    await this.sessionRepository.completeSessionTransaction(sessionId);

    // Trigger chapter generation (async in real world, but maybe sync for MVP flow simplicity or background job)
    // For MVP, we can just trigger it here.
    // In strict architecture, we might publish an event.
    // We'll call the use case directly but ideally this runs in background.
    // For now, let's assume this is fire-and-forget or awaited.
    await this.generateChapterUseCase.execute(sessionId);
  }
}
