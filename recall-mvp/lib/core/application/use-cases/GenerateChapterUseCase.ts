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
import { StorybookGeneratorPort } from '../ports/StorybookGeneratorPort';
import { AgentMemoryPort } from '../ports/AgentMemoryPort';
import { MemoryType } from '../agent/memory/AgentMemory';

type AgentMemoryFactory = (userId: string) => AgentMemoryPort;

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
    private llm: LLMPort,
    private storybookGenerator: StorybookGeneratorPort,
    private agentMemoryFactory: AgentMemoryFactory
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
    logger.info('[GenerateChapter] Starting chapter generation', { sessionId });

    // 1. Validate session exists
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      logger.error('[GenerateChapter] Session not found', { sessionId });
      throw new Error(`Session not found: ${sessionId}`);
    }

    // 2. Check for duplicate processing (idempotency guard)
    const existingChapters = await this.chapterRepository.findBySessionId(sessionId);
    if (existingChapters && existingChapters.length > 0) {
      logger.warn('[GenerateChapter] Session already has a chapter, skipping generation', {
        sessionId,
        existingChapterId: existingChapters[0].id
      });
      return {
        chapterId: existingChapters[0].id,
        hallucinationCheck: undefined, // Already processed
      };
    }

    logger.info('[GenerateChapter] Session validated, parsing transcript', {
      sessionId,
      userId: session.userId,
      transcriptRawType: typeof session.transcriptRaw,
      transcriptRawIsArray: Array.isArray(session.transcriptRaw),
      transcriptRawLength: Array.isArray(session.transcriptRaw) ? session.transcriptRaw.length :
        (typeof session.transcriptRaw === 'string' ? session.transcriptRaw.length :
          JSON.stringify(session.transcriptRaw || null).length),
      transcriptRawPreview: typeof session.transcriptRaw === 'string'
        ? session.transcriptRaw.substring(0, 200)
        : JSON.stringify(session.transcriptRaw).substring(0, 200),
    });

    // Handle transcriptRaw being either a JSON string OR already an object/array
    let transcript: any[] = [];
    try {
      const raw = session.transcriptRaw;

      if (!raw) {
        transcript = [];
      } else if (Array.isArray(raw)) {
        // Already an array (e.g., from ORM that deserializes JSON)
        transcript = raw;
      } else if (typeof raw === 'object') {
        // It's an object but not array - might be wrapped
        transcript = Array.isArray((raw as any).messages) ? (raw as any).messages : [];
      } else if (typeof raw === 'string') {
        // It's a JSON string - parse it
        const trimmed = raw.trim();
        transcript = trimmed ? JSON.parse(trimmed) : [];
      } else {
        transcript = [];
      }
    } catch (e) {
      const preview = typeof session.transcriptRaw === 'string'
        ? session.transcriptRaw.substring(0, 50)
        : JSON.stringify(session.transcriptRaw).substring(0, 50);
      console.warn(`[GenerateChapter] Failed to parse transcript for session ${sessionId}, defaulting to empty array. Raw type: ${typeof session.transcriptRaw}, preview: ${preview}...`);
      transcript = [];
    }

    // Ensure transcript is an array
    if (!Array.isArray(transcript)) {
      console.warn(`[GenerateChapter] Transcript is not an array after parsing, converting. Type: ${typeof transcript}`);
      transcript = [];
    }

    // Validate: Don't attempt chapter generation from empty/insufficient content
    if (!transcript || transcript.length === 0) {
      throw new Error(`Cannot generate chapter: Session ${sessionId} has no transcript content. The user may have ended the session before speaking.`);
    }

    const transcriptText = transcript.map((m: any) => `${m.speaker || 'unknown'}: ${m.text || ''}`).join('\n');

    // Additional check: Ensure there's meaningful text content
    if (transcriptText.trim().length < 50) {
      throw new Error(`Cannot generate chapter: Session ${sessionId} has insufficient transcript content (${transcriptText.length} chars). A minimum of 50 characters is required.`);
    }

    // Fetch previous chapters for context
    const previousChapters = await this.chapterRepository.findByUserId(session.userId);

    // ============================================================================
    // DEEP MEMORY CONTEXT - Validate & Extract Atoms
    // ============================================================================
    // "Day 0" Safety: If no previous chapters, we use User Profile as the seed.
    const deepContext: any = {
      isDayZero: previousChapters.length === 0,
      knownThemes: [],
      cumulativeEmotionalState: 'neutral',
      memories: []
    };

    // Instantiate Memory Agent for this user
    const memoryAgent = this.agentMemoryFactory(session.userId);

    // Query Semantic/Episodic Memories based on transcript keywords
    // Simple verification: extract top nouns/themes from transcript (mocking extraction for now or use LLM)
    // For MVP/Evolution, we just do a broad query or use the transcript text directly.
    try {
      const memoryResults = await memoryAgent.query({
        query: transcriptText.substring(0, 300), // Use first part of transcript as query context
        types: [MemoryType.EPISODIC, MemoryType.SEMANTIC, MemoryType.LONG_TERM],
        limit: 3,
        minImportance: 2
      });
      deepContext.memories = memoryResults.map(m => m.content);
      logger.info('[GenerateChapter] Retrieved memories', { count: memoryResults.length, sessionId });
    } catch (err) {
      logger.warn('[GenerateChapter] Failed to retrieve memories', { error: err });
    }

    if (previousChapters.length > 0) {
      // Extract atoms from previous chapters to maintain narrative continuity
      deepContext.knownThemes = previousChapters
        .map(c => c.metadata?.atoms?.narrativeArc)
        .filter(Boolean);

      // Simple recency bias for emotional state
      if (previousChapters[0].metadata?.emotionalTone) {
        deepContext.cumulativeEmotionalState = previousChapters[0].metadata.emotionalTone;
      }
    } else {
      // Day 0: Fetch User Profile for initial grounding
      try {
        const user = await this.userRepository.findById(session.userId);
        if (user) {
          deepContext.userSeed = {
            name: user.name,
            // Add other safe profile fields if available
          };
        }
      } catch (err) {
        logger.warn('[GenerateChapter] Failed to fetch user profile for Day 0 context', { userId: session.userId });
      }
    }

    const previousSummaries = previousChapters.slice(0, 5).map(ch => ({
      title: ch.title,
      summary: ch.excerpt,
      // Pass atoms if available, otherwise undefined (Generator must handle this)
      atoms: ch.metadata?.atoms
    }));

    // Use Injected Chapter Generator
    const { chapter: content, atoms } = await this.chapterGenerator.generateChapter(transcriptText, previousSummaries, deepContext);

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
    // HARDENING: Determine if chapter requires manual review based on hallucination risk
    const requiresReview = hallucinationResult?.risk === 'high' || hallucinationResult?.risk === 'medium';
    if (requiresReview) {
      logger.warn('[GenerateChapter] Chapter flagged for review due to hallucination risk', {
        sessionId,
        risk: hallucinationResult?.risk,
        flaggedCount: hallucinationResult?.flaggedCount,
      });
    }

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
        // HARDENING: Explicit flag for family dashboard to surface
        requiresReview: requiresReview,
        reviewReason: requiresReview ? `Hallucination risk: ${hallucinationResult?.risk}` : undefined,
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

    // ============================================================================
    // AGENTIC AUDIO GENERATION - Automatically generate narration
    // ============================================================================
    try {
      logger.info('[GenerateChapter] Triggering agentic audio generation', { chapterId: createdChapter.id });
      // Import dynamically or use DI if possible, here using direct import for MVP speed
      const { GenerateChapterAudioUseCase } = await import('./GenerateChapterAudioUseCase');
      // Note: In a cleaner DI setup this would be injected
      const { speechProvider, chapterRepository } = await import('@/lib/infrastructure/di/container');

      const audioGenerator = new GenerateChapterAudioUseCase(speechProvider, chapterRepository, this.userRepository);
      // Fire and forget - don't block response
      audioGenerator.execute(createdChapter.id).catch(err => {
        logger.error('[GenerateChapter] Async audio generation failed', { error: err.message });
      });
    } catch (error) {
      logger.error('[GenerateChapter] Failed to trigger audio generation', { error: (error as any).message });
    }

    // ============================================================================
    // AGENTIC STORYBOOK - Proactive Visual Imagination
    // ============================================================================
    try {
      logger.info('[GenerateChapter] Triggering agentic storybook imagination', { chapterId: createdChapter.id });

      // Prepare context for Storybook Agent
      const storybookContext = {
        characterName: deepContext.userSeed?.name || 'The Protagonist',
        characterDescription: deepContext.userSeed?.bio, // Or extract from memories/atoms if available
        visualThemes: atoms.sensoryDetails || deepContext.knownThemes || [],
        timePeriod: chapter.metadata?.lifePeriod || 'Timeless',
      };

      // Fire and forget - the agent will work in the background
      this.storybookGenerator.generateStorybook(createdChapter.id, storybookContext).catch(err => {
        logger.error('[GenerateChapter] Async storybook generation failed', { error: err.message });
      });
    } catch (error) {
      logger.error('[GenerateChapter] Failed to trigger storybook generation', { error: (error as any).message });
    }

    return {
      chapterId: createdChapter.id,
      hallucinationCheck: hallucinationResult,
    };
  }
}
