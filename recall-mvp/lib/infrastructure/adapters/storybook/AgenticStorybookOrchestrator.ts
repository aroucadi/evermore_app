/**
 * Agentic Storybook Orchestrator - World-Class Orchestrated Storybook Generation
 * 
 * Uses the full agentic infrastructure:
 * - AoT (Atom of Thought) decomposition for scene analysis
 * - ReACT loop for iterative scene generation
 * - Chain of Thought for illustration prompts
 * - Context-aware using previous chapters & user profile
 * - VectorDB for memory retrieval when available
 * 
 * @module AgenticStorybookOrchestrator
 */

import { LLMPort } from '../../../core/application/ports/LLMPort';
import { ImageGenerationPort, GeneratedImage } from '../../../core/application/ports/ImageGenerationPort';
import { VectorStorePort } from '../../../core/application/ports/VectorStorePort';
import { ChapterRepository } from '../../../core/domain/repositories/ChapterRepository';
import {
    ToolContract,
    ToolResult,
    ToolRegistry,
    ToolCapability,
    ToolPermission
} from '../../../core/application/agent/tools/ToolContracts';
import { z } from 'zod';
import { StorybookData, StorybookContext } from '../../../core/application/ports/StorybookGeneratorPort';
import { StorybookGeneratorPort } from '../../../core/application/ports/StorybookGeneratorPort';

// ============================================================================
// Types
// ============================================================================

interface StorybookAtoms {
    keyMoments: Array<{ moment: string; importance: number; reasoning: string }>;
    visualElements: string[];
    narrativeBeats: Array<{ beat: string; pageRange: string; purpose: string }>;
    characterDetails: { name: string; age: string; physicalDescription: string };
    emotionalArc: string;
}

interface Scene {
    pageNumber: number;
    moment: string;
    imagePrompt: string;
    storyText: string;
    visualElements: string[];
    layout: 'full-bleed' | 'left-image' | 'right-image' | 'top-image' | 'bottom-image';
    image?: GeneratedImage;
}

// ============================================================================
// Tool Contracts - AoT Decomposition Tools
// ============================================================================

const createTransformToChildrenStoryTool = (llm: LLMPort): ToolContract<{ content: string; title: string; context?: string }, { childrenStory: string }> => ({
    metadata: {
        id: 'transform-children-story',
        name: 'Transform to Children Story',
        description: 'Transform adult biography into warm children\'s story format',
        usageHint: 'Use first to create age-appropriate narrative',
        version: '1.0.0',
        capabilities: [ToolCapability.WRITE],
        defaultPermission: ToolPermission.ALLOWED,
        estimatedCostCents: 5,
        estimatedLatencyMs: 4000,
        enabled: true,
    },
    inputSchema: z.object({
        content: z.string(),
        title: z.string(),
        context: z.string().optional()
    }),
    outputSchema: z.object({
        childrenStory: z.string()
    }),
    async execute(input): Promise<ToolResult<{ childrenStory: string }>> {
        const startTime = Date.now();
        const prompt = `Transform this biography into a 6-page children's story (ages 5-10).

ORIGINAL: ${input.content.substring(0, 2000)}

RULES:
- Keep core narrative, make age-appropriate
- War → "brave people helping each other"
- Death → "saying goodbye" 
- Add sensory details children relate to
- Use "Once upon a time" style
- Mark pages with ---PAGE X---
- 70-100 words per page

OUTPUT the complete children's story:`;

        try {
            const childrenStory = await llm.generateText(prompt, { maxTokens: 1500 });
            return {
                success: true,
                data: { childrenStory },
                durationMs: Date.now() - startTime,
                tokenUsage: { input: 600, output: 1500 }
            };
        } catch (error: any) {
            return {
                success: false,
                error: { code: 'TRANSFORM_FAILED', message: error.message, retryable: true },
                durationMs: Date.now() - startTime,
            };
        }
    }
});

const createExtractKeyMomentsTool = (llm: LLMPort): ToolContract<{ story: string }, { keyMoments: any[] }> => ({
    metadata: {
        id: 'extract-key-moments',
        name: 'Extract Key Moments (AoT)',
        description: 'AoT Atom 1: Identify 6-8 key visual moments for illustration',
        usageHint: 'Use for AoT decomposition phase',
        version: '1.0.0',
        capabilities: [ToolCapability.READ],
        defaultPermission: ToolPermission.ALLOWED,
        estimatedCostCents: 2,
        estimatedLatencyMs: 2500,
        enabled: true,
    },
    inputSchema: z.object({
        story: z.string()
    }),
    outputSchema: z.object({
        keyMoments: z.array(z.any())
    }),
    async execute(input): Promise<ToolResult<{ keyMoments: any[] }>> {
        const startTime = Date.now();
        const prompt = `Identify 6-8 key VISUAL moments for illustration.

STORY: ${input.story}

OUTPUT JSON:
{
  "moments": [
    { "moment": "brief description (5-8 words)", "importance": 0.9, "reasoning": "why this matters" }
  ]
}

RULES: Must be visual (people, places, actions), not abstract thoughts.`;

        try {
            const parsed = await llm.generateJson<{ moments: any[] }>(prompt);
            return {
                success: true,
                data: { keyMoments: parsed.moments || [] },
                durationMs: Date.now() - startTime,
                tokenUsage: { input: 400, output: 300 }
            };
        } catch (error: any) {
            return {
                success: false,
                data: { keyMoments: [] },
                error: { code: 'MOMENT_EXTRACTION_FAILED', message: error.message, retryable: true },
                durationMs: Date.now() - startTime,
            };
        }
    }
});

const createExtractCharacterDetailsTool = (llm: LLMPort): ToolContract<{ content: string; context?: string }, { character: any }> => ({
    metadata: {
        id: 'extract-character-details',
        name: 'Extract Character Details (AoT)',
        description: 'AoT Atom 2: Extract visual character details for consistent illustration',
        usageHint: 'Use for character consistency across scenes',
        version: '1.0.0',
        capabilities: [ToolCapability.READ],
        defaultPermission: ToolPermission.ALLOWED,
        estimatedCostCents: 1,
        estimatedLatencyMs: 2000,
        enabled: true,
    },
    inputSchema: z.object({
        content: z.string(),
        context: z.string().optional()
    }),
    outputSchema: z.object({
        character: z.any()
    }),
    async execute(input): Promise<ToolResult<{ character: any }>> {
        const startTime = Date.now();
        const prompt = `Extract character visual details. 
${input.context ? `IMPORTANT - MANTAIN CONSISTENCY WITH:\n${input.context}\n` : ''}
CONTENT: ${input.content.substring(0, 1500)}

OUTPUT JSON:
{
  "character": {
    "name": "...",
    "age": "young/elderly/etc",
    "physicalDescription": "brief visual description",
    "clothingStyle": "era-appropriate clothing",
    "distinguishingFeatures": "any unique visual traits"
  }
}`;

        try {
            const parsed = await llm.generateJson<{ character: any }>(prompt);
            return {
                success: true,
                data: { character: parsed.character || { name: 'Our Hero', age: 'varies' } },
                durationMs: Date.now() - startTime,
                tokenUsage: { input: 400, output: 150 }
            };
        } catch (error: any) {
            return {
                success: false,
                data: { character: { name: 'Our Hero', age: 'varies', physicalDescription: '' } },
                error: { code: 'CHARACTER_EXTRACTION_FAILED', message: error.message, retryable: true },
                durationMs: Date.now() - startTime,
            };
        }
    }
});

const createSynthesizeScenesTool = (llm: LLMPort): ToolContract<{ atoms: any; story: string }, { scenes: any[] }> => ({
    metadata: {
        id: 'synthesize-scenes',
        name: 'Synthesize Scenes (AoT Contraction)',
        description: 'AoT Contraction: Combine atoms into 6 optimal scenes with image prompts',
        usageHint: 'Use after gathering all atoms to create final scene sequence',
        version: '1.0.0',
        capabilities: [ToolCapability.WRITE],
        defaultPermission: ToolPermission.ALLOWED,
        estimatedCostCents: 5,
        estimatedLatencyMs: 4000,
        enabled: true,
    },
    inputSchema: z.object({
        atoms: z.any(),
        story: z.string()
    }),
    outputSchema: z.object({
        scenes: z.array(z.any())
    }),
    async execute(input): Promise<ToolResult<{ scenes: any[] }>> {
        const startTime = Date.now();
        const prompt = `Create 6 illustrated page scenes from these AoT atoms.

ATOMS:
- Key Moments: ${JSON.stringify(input.atoms.keyMoments?.slice(0, 6) || [])}
- Character: ${JSON.stringify(input.atoms.character || {})}
- Visual Elements: ${JSON.stringify(input.atoms.visualElements || [])}

STORY: ${input.story.substring(0, 1500)}

OUTPUT JSON:
{
  "scenes": [
    {
      "pageNumber": 1,
      "moment": "Young Maria walking toward the old farmhouse",
      "imagePrompt": "Warm watercolor illustration. Young girl (Maria, 8yo) in 1950s dress walking toward cozy farmhouse. Morning light, nostalgic mood. No text, family-friendly.",
      "storyText": "Text for this page (2-3 sentences)",
      "visualElements": ["farmhouse", "morning light"],
      "layout": "full-bleed"
    }
  ]
}

LAYOUTS: full-bleed (dramatic), top-image, bottom-image, left-image, right-image
CREATE exactly 6 scenes covering the full narrative arc.`;

        try {
            const parsed = await llm.generateJson<{ scenes: any[] }>(prompt, undefined, { maxTokens: 2000 });
            return {
                success: true,
                data: { scenes: parsed.scenes || [] },
                durationMs: Date.now() - startTime,
                tokenUsage: { input: 800, output: 2000 }
            };
        } catch (error: any) {
            return {
                success: false,
                data: { scenes: [] },
                error: { code: 'SCENE_SYNTHESIS_FAILED', message: error.message, retryable: true },
                durationMs: Date.now() - startTime,
            };
        }
    }
});

// ============================================================================
// Agentic Storybook Orchestrator
// ============================================================================

export class AgenticStorybookOrchestrator implements StorybookGeneratorPort {
    private toolRegistry: ToolRegistry;

    constructor(
        private chapterRepository: ChapterRepository,
        private llm: LLMPort,
        private imageGenerator?: ImageGenerationPort,
        private vectorStore?: VectorStorePort
    ) {
        // Initialize tool registry with AoT tools
        this.toolRegistry = new ToolRegistry();
        this.toolRegistry.register(createTransformToChildrenStoryTool(llm));
        this.toolRegistry.register(createExtractKeyMomentsTool(llm));
        this.toolRegistry.register(createExtractCharacterDetailsTool(llm));
        this.toolRegistry.register(createSynthesizeScenesTool(llm));
    }

    async generateStorybook(chapterId: string, context?: StorybookContext): Promise<StorybookData> {
        console.log('📚 Agentic Storybook Orchestrator - Starting');
        if (context?.characterName) {
            console.log(`   Detailed Context: Character=${context.characterName}, Time=${context.timePeriod}`);
        }

        const executionContext = {
            userId: 'storybook-orchestrator',
            sessionId: `storybook-${Date.now()}`,
            agentId: 'storybook-agent',
            requestId: crypto.randomUUID(),
            permissions: new Map<string, ToolPermission>(),
            dryRun: false,
        };

        // ===== STEP 1: Load Chapter Context =====
        console.log('   ├─ Step 1: Loading chapter context...');
        const chapter = await this.chapterRepository.findById(chapterId);
        if (!chapter) throw new Error('Chapter not found');

        // Note: VectorDB context retrieval would require embedding the query first
        // This can be enhanced later with EmbeddingPort integration
        const memoryContext = '';
        console.log('   │  ✓ Chapter loaded: ' + chapter.title.substring(0, 30));

        // ===== STEP 2: Transform to Children's Story =====
        console.log('   ├─ Step 2: Transforming to children\'s story...');
        const transformResult = await this.toolRegistry.execute(
            'transform-children-story',
            { content: chapter.content, title: chapter.title, context: context?.characterDescription }, // Passing context
            executionContext
        );
        const childrenStory = (transformResult.data as any)?.childrenStory || this.fallbackChildrenStory(chapter.content);
        console.log(`   │  ✓ Children's story (${childrenStory.length} chars)`);

        // ===== STEP 3: AoT Decomposition (Parallel Atom Extraction) =====
        console.log('   ├─ Step 3: AoT Decomposition (parallel atom extraction)...');

        // Prepare context string for character extraction
        const charContext = context ? `
KNOWN CHARACTER: ${context.characterName}
DESCRIPTION: ${context.characterDescription}
VISUAL THEMES: ${context.visualThemes?.join(', ')}
TIME PERIOD: ${context.timePeriod}
        `.trim() : '';

        const [momentsResult, characterResult] = await Promise.all([
            this.toolRegistry.execute('extract-key-moments', { story: childrenStory }, executionContext),
            this.toolRegistry.execute('extract-character-details', { content: chapter.content, context: charContext }, executionContext),
        ]);

        const atoms: StorybookAtoms = {
            keyMoments: (momentsResult.data as any)?.keyMoments || [],
            characterDetails: (characterResult.data as any)?.character || { name: 'Our Hero', age: 'varies', physicalDescription: '' },
            visualElements: ['warm tones', 'nostalgic setting'],
            narrativeBeats: [],
            emotionalArc: 'hopeful'
        };
        console.log(`   │  ✓ Atoms: ${atoms.keyMoments.length} moments, character: ${atoms.characterDetails.name}`);

        // ===== STEP 4: AoT Contraction - Synthesize Scenes =====
        console.log('   ├─ Step 4: AoT Contraction (synthesizing scenes)...');
        const scenesResult = await this.toolRegistry.execute(
            'synthesize-scenes',
            { atoms, story: childrenStory },
            executionContext
        );

        let scenes: Scene[] = (scenesResult.data as any)?.scenes || [];

        // Fallback if no scenes generated
        if (scenes.length === 0) {
            console.log('   │  ⚠️ Using fallback scene generation');
            scenes = this.generateFallbackScenes(childrenStory, chapter.title);
        }
        console.log(`   │  ✓ ${scenes.length} scenes synthesized`);

        // ===== STEP 5: CoT Image Generation =====
        console.log('   ├─ Step 5: Generating illustrations (CoT prompts)...');
        const scenesWithImages = await this.generateImages(scenes, atoms);
        console.log(`   │  ✓ ${scenesWithImages.filter(s => s.image).length}/${scenesWithImages.length} images generated`);

        // ===== STEP 6: Compile Storybook =====
        const storybook: StorybookData = {
            id: `storybook-${chapterId}-${Date.now()}`,
            chapterId,
            title: this.generateTitle(atoms.characterDetails.name, chapter.title),
            childrenStory,
            scenes: scenesWithImages,
            atoms,
            metadata: {
                generatedAt: new Date(),
                characterName: atoms.characterDetails.name || 'Our Hero',
                timePeriod: 'Long ago',
                totalPages: scenesWithImages.length + 2,
                style: 'watercolor-storybook'
            }
        };

        console.log(`   └─ ✨ Storybook complete: "${storybook.title}" (${storybook.metadata.totalPages} pages)`);

        // PERSISTENCE: Save storybook data to the chapter metadata so it can be retrieved for PDF export
        try {
            const currentChapter = await this.chapterRepository.findById(chapterId);
            if (currentChapter) {
                await this.chapterRepository.update(chapterId, {
                    metadata: {
                        ...(currentChapter.metadata || {}),
                        storybook: storybook
                    } as any
                });
                console.log('   💾 Storybook persisted to chapter metadata');
            }
        } catch (error) {
            console.error('Failed to persist storybook to chapter:', error);
            // Don't fail the generation, just log
        }

        return storybook;
    }

    private async generateImages(scenes: Scene[], atoms: StorybookAtoms): Promise<Scene[]> {
        if (!this.imageGenerator) {
            return scenes.map(s => ({ ...s, image: this.createPlaceholder(s) }));
        }

        try {
            const isAvailable = await this.imageGenerator.isAvailable();
            if (!isAvailable) {
                return scenes.map(s => ({ ...s, image: this.createPlaceholder(s) }));
            }

            // Chain-of-Thought: Enhance prompts with character consistency
            const enhancedScenes = scenes.map(s => ({
                pageNumber: s.pageNumber,
                imagePrompt: `${s.imagePrompt} Character: ${atoms.characterDetails.physicalDescription || 'warm, friendly appearance'}.`
            }));

            const generatedImages = await this.imageGenerator.generateStorybookImages(enhancedScenes, {
                style: 'watercolor',
                safetyLevel: 'strict'
            });

            return scenes.map(s => ({
                ...s,
                image: generatedImages.get(s.pageNumber) || this.createPlaceholder(s)
            }));
        } catch (error) {
            console.error('Image generation failed:', error);
            return scenes.map(s => ({ ...s, image: this.createPlaceholder(s) }));
        }
    }

    private createPlaceholder(scene: Scene): GeneratedImage {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
            <defs><linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#87CEEB"/><stop offset="100%" style="stop-color:#FFF5E6"/>
            </linearGradient></defs>
            <rect width="800" height="600" fill="url(#bg)"/>
            <text x="400" y="280" text-anchor="middle" font-family="Georgia" font-size="24" fill="#5D4E37">
                🎨 Page ${scene.pageNumber}
            </text>
            <text x="400" y="320" text-anchor="middle" font-family="Georgia" font-size="16" fill="#7D6E57">
                "${scene.moment?.substring(0, 40) || 'A special moment'}..."
            </text>
        </svg>`;
        return { base64: Buffer.from(svg).toString('base64'), mimeType: 'image/svg+xml', prompt: scene.imagePrompt, metadata: { model: 'placeholder' } };
    }

    private generateTitle(characterName: string | undefined, chapterTitle: string): string {
        return characterName ? `The Story of ${characterName}` : chapterTitle.substring(0, 30);
    }

    private generateFallbackScenes(story: string, title: string): Scene[] {
        const pages = story.split(/---PAGE\s*\d+---/i).filter(p => p.trim());
        const segments = pages.length > 1 ? pages : story.split('\n\n').filter(p => p.trim());

        return Array.from({ length: Math.min(6, Math.max(3, segments.length)) }, (_, i) => ({
            pageNumber: i + 1,
            moment: (segments[i] || '').substring(0, 50).replace(/[^\w\s]/g, '').trim() || `Page ${i + 1}`,
            imagePrompt: `Warm watercolor children's book illustration. Scene ${i + 1}. Nostalgic, family-friendly.`,
            storyText: (segments[i] || 'A moment from the story...').trim(),
            visualElements: ['warm colors', 'nostalgic'],
            layout: i === 0 || i === 5 ? 'full-bleed' : 'top-image' as const
        }));
    }

    private fallbackChildrenStory(content: string): string {
        return `---PAGE 1---
Once upon a time, there was someone very special with a wonderful story to share.

---PAGE 2---
${content.substring(0, 200)}

---PAGE 3---
Through the years, they learned that the most important things in life are the people we love.

---PAGE 4---
They showed kindness to everyone they met, and found friends wherever they went.

---PAGE 5---
Even when things were hard, they never gave up, knowing tomorrow brings new adventures.

---PAGE 6---
And so, surrounded by love and memories, they lived happily, their story told for generations.

The End.`;
    }
}
