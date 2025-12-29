/**
 * Agentic Chapter Generator - Orchestrated Chapter Generation
 * 
 * Uses EnhancedReActAgent with proper tool contracts for chapter generation.
 * This replaces simple LLM wrappers with full agentic orchestration.
 * 
 * @module AgenticChapterGenerator
 */

import { ChapterGeneratorPort, ChapterGeneratorResult, ChapterGenerationContext } from '../../../core/application/ports/ChapterGeneratorPort';
import { LLMPort } from '../../../core/application/ports/LLMPort';
import { EnhancedReActAgent } from '../../../core/application/agent/EnhancedReActAgent';
import {
    ToolContract,
    ToolResult,
    ToolMetadata,
    ToolRegistry,
    ToolCapability,
    ToolPermission
} from '../../../core/application/agent/tools/ToolContracts';
import { ModelRouter, ModelProfile, DEFAULT_MODELS } from '../../../core/application/agent/routing/ModelRouter';
import { z } from 'zod';

// ============================================================================
// Tool Contracts for Chapter Generation
// ============================================================================

const createExtractNarrativeArcTool = (llm: LLMPort): ToolContract<{ transcript: string }, { narrativeArc: string }> => ({
    metadata: {
        id: 'extract-narrative-arc',
        name: 'Extract Narrative Arc',
        description: 'Analyze transcript to identify the primary narrative arc and story theme',
        usageHint: 'Use this first to understand the main story',
        version: '1.0.0',
        capabilities: [ToolCapability.READ],
        defaultPermission: ToolPermission.ALLOWED,
        estimatedCostCents: 1,
        estimatedLatencyMs: 2000,
        enabled: true,
    },
    inputSchema: z.object({
        transcript: z.string().describe('The conversation transcript to analyze')
    }),
    outputSchema: z.object({
        narrativeArc: z.string()
    }),
    async execute(input: { transcript: string }): Promise<ToolResult<{ narrativeArc: string }>> {
        const startTime = Date.now();
        try {
            const prompt = `Analyze this transcript and identify the primary narrative arc in ONE sentence (10-20 words):
TRANSCRIPT: ${input.transcript.substring(0, 2000)}
OUTPUT: Just the narrative arc sentence, nothing else.`;

            const result = await llm.generateText(prompt, { maxTokens: 50 });
            return {
                success: true,
                data: { narrativeArc: result.trim() },
                durationMs: Date.now() - startTime,
                tokenUsage: { input: 500, output: 50 }
            };
        } catch (error: any) {
            return {
                success: false,
                error: { code: 'NARRATIVE_EXTRACTION_FAILED', message: error.message, retryable: true },
                durationMs: Date.now() - startTime,
            };
        }
    }
});

const createExtractQuotesTool = (llm: LLMPort): ToolContract<{ transcript: string }, { quotes: any[] }> => ({
    metadata: {
        id: 'extract-quotes',
        name: 'Extract Best Quotes',
        description: 'Select the 2-3 best emotionally resonant quotes from transcript',
        usageHint: 'Use to find memorable quotes to include in chapter',
        version: '1.0.0',
        capabilities: [ToolCapability.READ],
        defaultPermission: ToolPermission.ALLOWED,
        estimatedCostCents: 1,
        estimatedLatencyMs: 2000,
        enabled: true,
    },
    inputSchema: z.object({
        transcript: z.string()
    }),
    outputSchema: z.object({
        quotes: z.array(z.any())
    }),
    async execute(input: { transcript: string }): Promise<ToolResult<{ quotes: any[] }>> {
        const startTime = Date.now();
        try {
            const prompt = `Select 2-3 best quotes from this conversation.
TRANSCRIPT: ${input.transcript.substring(0, 2000)}
OUTPUT JSON: { "quotes": [{ "text": "...", "reason": "..." }] }`;

            const parsed = await llm.generateJson<{ quotes: any[] }>(prompt);
            return {
                success: true,
                data: { quotes: parsed.quotes || [] },
                durationMs: Date.now() - startTime,
                tokenUsage: { input: 500, output: 150 }
            };
        } catch (error: any) {
            return {
                success: false,
                data: { quotes: [] },
                error: { code: 'QUOTE_EXTRACTION_FAILED', message: error.message, retryable: true },
                durationMs: Date.now() - startTime,
            };
        }
    }
});

const createDetectEmotionTool = (llm: LLMPort): ToolContract<{ transcript: string }, { emotion: string; confidence: number }> => ({
    metadata: {
        id: 'detect-emotion',
        name: 'Detect Emotional Tone',
        description: 'Determine the primary emotional valence of the story',
        usageHint: 'Use to understand the emotional tone for appropriate writing style',
        version: '1.0.0',
        capabilities: [ToolCapability.READ],
        defaultPermission: ToolPermission.ALLOWED,
        estimatedCostCents: 1,
        estimatedLatencyMs: 1500,
        enabled: true,
    },
    inputSchema: z.object({
        transcript: z.string()
    }),
    outputSchema: z.object({
        emotion: z.string(),
        confidence: z.number()
    }),
    async execute(input: { transcript: string }): Promise<ToolResult<{ emotion: string; confidence: number }>> {
        const startTime = Date.now();
        try {
            const prompt = `Determine the primary emotional valence.
TRANSCRIPT: ${input.transcript.substring(0, 1500)}
OUTPUT JSON: { "emotion": "joy|sadness|nostalgia|pride|love|neutral", "confidence": 0.85, "evidence": "brief reason" }`;

            const parsed = await llm.generateJson<{ emotion: string; confidence: number }>(prompt);
            return {
                success: true,
                data: { emotion: parsed.emotion || 'neutral', confidence: parsed.confidence || 0.5 },
                durationMs: Date.now() - startTime,
                tokenUsage: { input: 400, output: 50 }
            };
        } catch (error: any) {
            return {
                success: false,
                data: { emotion: 'neutral', confidence: 0.5 },
                error: { code: 'EMOTION_DETECTION_FAILED', message: error.message, retryable: true },
                durationMs: Date.now() - startTime,
            };
        }
    }
});

const createSynthesizeChapterTool = (llm: LLMPort): ToolContract<any, { chapter: string }> => ({
    metadata: {
        id: 'synthesize-chapter',
        name: 'Synthesize Chapter',
        description: 'Create the final audio-optimized chapter from analyzed insights',
        usageHint: 'Use after gathering all insights to create the final chapter',
        version: '1.0.0',
        capabilities: [ToolCapability.WRITE],
        defaultPermission: ToolPermission.ALLOWED,
        estimatedCostCents: 5,
        estimatedLatencyMs: 5000,
        enabled: true,
    },
    inputSchema: z.object({
        narrativeArc: z.string(),
        emotion: z.string(),
        quotes: z.array(z.any()),
        transcript: z.string(),
        context: z.string().optional()
    }),
    outputSchema: z.object({
        chapter: z.string()
    }),
    async execute(input: any): Promise<ToolResult<{ chapter: string }>> {
        const startTime = Date.now();
        try {
            const prompt = `You are a masterful storyteller creating an audio biography chapter.

INSIGHTS:
- Core Narrative: ${input.narrativeArc}
- Primary Emotion: ${input.emotion}
- Best Quotes: ${JSON.stringify(input.quotes || [])}

${input.context ? `CONTEXT:\n${input.context}\n` : ''}

TRANSCRIPT: ${input.transcript?.substring(0, 1500) || ''}

WRITE an audio-optimized chapter (400-600 words):
- NO markdown (##, *, bullets)
- Natural paragraphs with pauses (...)
- Warm, intimate tone like telling a story by firelight
- Structure: Title → Hook → Scene → Body → Climax → Reflection
- Numbers as words, no abbreviations
- IMPORTANT: Integrate the User Context (Memories/Themes) subtly to show continuity.`;

            const chapter = await llm.generateText(prompt, { maxTokens: 1200 });
            return {
                success: true,
                data: { chapter },
                durationMs: Date.now() - startTime,
                tokenUsage: { input: 600, output: 1200 }
            };
        } catch (error: any) {
            return {
                success: false,
                error: { code: 'SYNTHESIS_FAILED', message: error.message, retryable: true },
                durationMs: Date.now() - startTime,
            };
        }
    }
});

// ============================================================================
// Agentic Chapter Generator
// ============================================================================

export class AgenticChapterGenerator implements ChapterGeneratorPort {
    private toolRegistry: ToolRegistry;

    constructor(private llm: LLMPort) {
        // Create and register tools
        this.toolRegistry = new ToolRegistry();
        this.toolRegistry.register(createExtractNarrativeArcTool(llm));
        this.toolRegistry.register(createExtractQuotesTool(llm));
        this.toolRegistry.register(createDetectEmotionTool(llm));
        this.toolRegistry.register(createSynthesizeChapterTool(llm));
    }

    async generateChapter(transcript: string, previousChapters: any[] = [], context?: ChapterGenerationContext): Promise<ChapterGeneratorResult> {
        console.log('🤖 Agentic Chapter Generation - Orchestrated Pipeline');
        if (context) {
            console.log(`   Detailed Context Available: Day0=${context.isDayZero}, User=${context.userSeed?.name}, Memories=${context.memories?.length || 0}`);
        }

        const executionContext = {
            userId: 'chapter-generator',
            sessionId: `chapter-${Date.now()}`,
            agentId: 'biographer-agent',
            requestId: crypto.randomUUID(),
            permissions: new Map<string, ToolPermission>(),
            dryRun: false,
        };

        const atoms: any = {
            narrativeArc: '',
            bestQuotes: [],
            sensoryDetails: [],
            emotionalValence: context?.cumulativeEmotionalState || 'neutral',
            previousChapterConnections: []
        };

        try {
            // STEP 1: Extract Narrative Arc
            console.log('   ├─ Step 1: Extracting narrative arc...');
            const narrativeResult = await this.toolRegistry.execute(
                'extract-narrative-arc',
                { transcript },
                executionContext
            );
            atoms.narrativeArc = (narrativeResult.data as any)?.narrativeArc || 'A special memory';
            console.log(`   │  ✓ Narrative: "${atoms.narrativeArc}"`);

            // STEP 2: Detect Emotion (parallel with quotes)
            console.log('   ├─ Step 2: Detecting emotion + extracting quotes...');
            const [emotionResult, quotesResult] = await Promise.all([
                this.toolRegistry.execute('detect-emotion', { transcript }, executionContext),
                this.toolRegistry.execute('extract-quotes', { transcript }, executionContext),
            ]);

            atoms.emotionalValence = (emotionResult.data as any)?.emotion || 'neutral';
            atoms.bestQuotes = (quotesResult.data as any)?.quotes || [];
            console.log(`   │  ✓ Emotion: ${atoms.emotionalValence}, Quotes: ${atoms.bestQuotes.length}`);

            // STEP 3: Synthesize Chapter
            console.log('   ├─ Step 3: Synthesizing chapter...');

            // Prepare rich context
            const userContextString = context ? `
USER PROFILE: ${context.userSeed?.name || 'Unknown'} (${context.userSeed?.age || '?'}yo). ${context.userSeed?.bio || ''}
MEMORIES: ${context.memories?.join('; ') || 'None'}
THEMES: ${context.knownThemes?.join(', ') || 'None'}
EMOTIONAL SATE: ${context.cumulativeEmotionalState || 'neutral'}
            `.trim() : '';

            const synthesisResult = await this.toolRegistry.execute(
                'synthesize-chapter',
                {
                    narrativeArc: atoms.narrativeArc,
                    emotion: atoms.emotionalValence,
                    quotes: atoms.bestQuotes,
                    transcript,
                    context: userContextString // passing as extra field (need to update schema)
                },
                executionContext
            );

            const chapter = (synthesisResult.data as any)?.chapter || this.fallbackChapter(transcript);
            console.log(`   └─ ✨ Chapter generated (${chapter.length} chars)`);

            return { chapter, atoms };

        } catch (error: any) {
            console.error('Agentic chapter generation failed:', error);
            return this.fallbackGeneration(transcript);
        }
    }

    private fallbackChapter(transcript: string): string {
        return `A Treasured Memory

The story begins as all great stories do, with a moment that would change everything...

${transcript.substring(0, 500)}

And so the memory lives on, a treasure passed from generation to generation.`;
    }

    private async fallbackGeneration(transcript: string): Promise<ChapterGeneratorResult> {
        console.log('⚠️ Using fallback simple generation');

        const prompt = `Create a warm, audio-friendly biography chapter from this transcript.
NO markdown. Natural paragraphs. 400-600 words.

TRANSCRIPT: ${transcript.substring(0, 2000)}`;

        try {
            const chapter = await this.llm.generateText(prompt, { maxTokens: 1200 });
            return {
                chapter,
                atoms: {
                    narrativeArc: 'Fallback generation',
                    bestQuotes: [],
                    sensoryDetails: [],
                    emotionalValence: 'neutral',
                    previousChapterConnections: []
                }
            };
        } catch {
            return {
                chapter: this.fallbackChapter(transcript),
                atoms: { narrativeArc: 'Fallback', bestQuotes: [], sensoryDetails: [], emotionalValence: 'neutral', previousChapterConnections: [] }
            };
        }
    }
}
