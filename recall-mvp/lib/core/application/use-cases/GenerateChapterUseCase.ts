import { ChapterRepository } from '../../domain/repositories/ChapterRepository';
import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { EmailServicePort } from '../ports/EmailServicePort';
import { Chapter } from '../../domain/entities/Chapter';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { ChapterGeneratorPort } from '../ports/ChapterGeneratorPort';
import { LLMPort } from '../ports/LLMPort';
import { randomUUID } from 'crypto';

export class GenerateChapterUseCase {
  constructor(
    private chapterRepository: ChapterRepository,
    private sessionRepository: SessionRepository,
    private userRepository: UserRepository,
    private chapterGenerator: ChapterGeneratorPort,
    private emailService: EmailServicePort,
    private llm: LLMPort // Injected but currently unused, keeping for consistency if logic expands
  ) {}

  async execute(sessionId: string): Promise<string> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new Error('Session not found');

    const transcript = JSON.parse(session.transcriptRaw || '[]');
    const transcriptText = transcript.map((m: any) => `${m.speaker}: ${m.text}`).join('\n');

    // Fetch previous chapters for context
    const previousChapters = await this.chapterRepository.findByUserId(session.userId);
    const previousSummaries = previousChapters.slice(0, 5).map(ch => ({
        title: ch.title,
        summary: ch.excerpt
    }));

    // Use Injected Chapter Generator
    const { chapter: content, atoms } = await this.chapterGenerator.generateChapter(transcriptText, previousSummaries);

    // Create Chapter Entity
    const chapter = new Chapter(
        randomUUID(),
        sessionId,
        session.userId,
        atoms.narrativeArc, // Title from AoT
        content,
        content.substring(0, 150) + '...', // Excerpt
        new Date(),
        undefined, // audioHighlightUrl
        undefined, // audioDuration
        undefined, // pdfUrl
        [],
        {
            sessionNumber: 1,
            wordCount: content.split(' ').length,
            emotionalTone: atoms.emotionalValence,
            lifePeriod: "Unknown",
            atoms: atoms
        }
    );

    chapter.validate(); // Ensure invariants

    const createdChapter = await this.chapterRepository.create(chapter);

    const user = await this.userRepository.findById(session.userId);
    if (user) {
        // Send to family member if exists, or user
        await this.emailService.sendChapterNotification(createdChapter.id, user.email);
    }

    return createdChapter.id;
  }
}
