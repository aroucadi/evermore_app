import { ChapterRepository } from '../../domain/repositories/ChapterRepository';
import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { AIServicePort } from '../ports/AIServicePort';
import { EmailServicePort } from '../ports/EmailServicePort';
import { Chapter } from '../../domain/entities/Chapter';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { randomUUID } from 'crypto';
import AoTChapterGenerator from '../../../services/biographer/AoTChapterGenerator';

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

    // Fetch previous chapters for context
    const previousChapters = await this.chapterRepository.findByUserId(session.userId);
    const previousSummaries = previousChapters.slice(0, 5).map(ch => ({
        title: ch.title,
        summary: ch.excerpt // Using excerpt as summary
    }));

    // Use AoT Chapter Generator
    const generator = new AoTChapterGenerator();
    const { chapter: content, atoms } = await generator.generateChapter(transcriptText, previousSummaries);

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
        // Extract entities from atoms if possible, or use empty array.
        // AoT atoms include people/places in `sensoryDetails` or `bestQuotes` context sometimes,
        // but strictly speaking we don't have a dedicated entity extraction atom yet.
        // We can pass empty array for now or try to map something if needed.
        [],
        {
            sessionNumber: 1, // Logic to count sessions needed
            wordCount: content.split(' ').length,
            emotionalTone: atoms.emotionalValence,
            lifePeriod: "Unknown", // AoT doesn't explicitly return this separately but could be parsed
            atoms: atoms // Store atoms for debugging/future use
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
