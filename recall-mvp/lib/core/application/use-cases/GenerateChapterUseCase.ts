import { ChapterRepository } from '../../domain/repositories/ChapterRepository';
import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { EmailServicePort } from '../ports/EmailServicePort';
import { Chapter } from '../../domain/entities/Chapter';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { ChapterGeneratorPort } from '../ports/ChapterGeneratorPort';
import { LLMPort } from '../ports/LLMPort';
import { HallucinationDetector } from '../safety/HallucinationDetector';
import { logger } from '../Logger';
import { randomUUID } from 'crypto';

export interface ChapterGenerationResult {
  chapterId: string;
  hallucinationCheck?: {
    passed: boolean;
    risk: 'low' | 'medium' | 'high';
    flaggedCount: number;
  };
}

export class GenerateChapterUseCase {
  private hallucinationDetector: HallucinationDetector;

  constructor(
    private chapterRepository: ChapterRepository,
    private sessionRepository: SessionRepository,
    private userRepository: UserRepository,
    private chapterGenerator: ChapterGeneratorPort,
    private emailService: EmailServicePort,
    private llm: LLMPort
  ) {
    // Initialize hallucination detector with injected LLM
    this.hallucinationDetector = new HallucinationDetector(llm, {
      flagThreshold: 0.7,
      suggestCorrections: true,
    });
  }

  async execute(sessionId: string): Promise<string> {
    const result = await this.executeWithValidation(sessionId);
    return result.chapterId;
  }

  /**
   * Execute with full validation and hallucination checking.
   */
  async executeWithValidation(sessionId: string): Promise<ChapterGenerationResult> {
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

    // ============================================================================
    // HALLUCINATION DETECTION - Validate generated content against transcript
    // ============================================================================
    let hallucinationResult: ChapterGenerationResult['hallucinationCheck'] = undefined;

    try {
      logger.info('Running hallucination detection on generated chapter', {
        sessionId,
        contentLength: content.length,
        transcriptLength: transcriptText.length,
      });

      const validation = await this.hallucinationDetector.comprehensiveCheck(
        content,
        [{
          id: 'session_transcript',
          type: 'transcript',
          content: transcriptText,
          confidence: 1,
        }]
      );

      hallucinationResult = {
        passed: validation.overallRisk !== 'high',
        risk: validation.overallRisk,
        flaggedCount: validation.allFlagged.length,
      };

      logger.info('Hallucination check complete', {
        sessionId,
        risk: validation.overallRisk,
        flaggedCount: validation.allFlagged.length,
        passed: hallucinationResult.passed,
      });

      // If high risk, log warnings but still create chapter (with flag)
      if (validation.overallRisk === 'high') {
        logger.warn('High hallucination risk detected in chapter', {
          sessionId,
          summary: validation.summary,
          flaggedSegments: validation.allFlagged.slice(0, 3).map(f => ({
            text: f.text.substring(0, 50),
            reason: f.reason,
            confidence: f.confidence,
          })),
        });
      }
    } catch (error) {
      // Hallucination check failure should not block chapter creation
      logger.error('Hallucination detection failed', {
        sessionId,
        error: (error as Error).message,
      });
    }

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
        atoms: atoms,
        // Include hallucination check result in metadata
        ...(hallucinationResult && {
          hallucinationCheck: hallucinationResult,
        }),
      }
    );

    chapter.validate(); // Ensure invariants

    const createdChapter = await this.chapterRepository.create(chapter);

    const user = await this.userRepository.findById(session.userId);
    if (user) {
      // Send to family member if exists, or user
      await this.emailService.sendChapterNotification(createdChapter.id, user.email);
    }

    return {
      chapterId: createdChapter.id,
      hallucinationCheck: hallucinationResult,
    };
  }
}
