import { ChapterRepository } from '../../domain/repositories/ChapterRepository';
import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { AIServicePort } from '../ports/AIServicePort';
import { EmailServicePort } from '../ports/EmailServicePort';
import { Chapter } from '../../domain/entities/Chapter';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { randomUUID } from 'crypto';

export class GenerateChapterUseCase {
  constructor(
    private chapterRepository: ChapterRepository,
    private sessionRepository: SessionRepository,
    private userRepository: UserRepository,
    private aiService: AIServicePort,
    private emailService: EmailServicePort
  ) {}

  async execute(sessionId: string): Promise<string> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new Error('Session not found');

    const transcript = JSON.parse(session.transcriptRaw || '[]');
    const transcriptText = transcript.map((m: any) => `${m.speaker}: ${m.text}`).join('\n');

    const analysis = await this.aiService.generateChapterAnalysis(transcriptText);
    const narrative = await this.aiService.generateChapterNarrative(transcriptText, analysis);

    const chapter = new Chapter(
        randomUUID(),
        sessionId,
        session.userId,
        analysis.title || "New Chapter",
        narrative.content,
        narrative.content.substring(0, 100) + '...',
        new Date(),
        undefined,
        undefined,
        undefined,
        analysis.entities,
        {
            sessionNumber: 1, // Logic to count sessions needed
            wordCount: narrative.wordCount,
            emotionalTone: analysis.tone,
            lifePeriod: analysis.period
        }
    );

    const createdChapter = await this.chapterRepository.create(chapter);

    const user = await this.userRepository.findById(session.userId);
    if (user) {
        // Send to family member if exists, or user
        await this.emailService.sendChapterNotification(createdChapter.id, user.email);
    }

    return createdChapter.id;
  }
}
