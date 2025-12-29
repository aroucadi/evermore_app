import { NextRequest, NextResponse } from 'next/server';
import { DrizzleChapterRepository } from '@/lib/infrastructure/adapters/db/DrizzleChapterRepository';
import { storybookOrchestrator } from '@/lib/infrastructure/di/container';
import { logger } from '@/lib/core/application/Logger';

/**
 * GET /api/storybooks/[id]
 * 
 * Fetches storybook data for the reader UI.
 * If storybook doesn't exist, generates it on-the-fly using Agentic Orchestrator.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: chapterId } = await params;
    const traceId = req.headers.get('x-trace-id') || crypto.randomUUID();

    try {
        // Note: Storybook is accessed by chapter ID, auth not strictly required
        // In production, you could verify chapter ownership if needed

        logger.info('Fetching storybook for reader (Agentic)', { traceId, chapterId });

        // Generate or retrieve storybook data using Agentic Orchestrator
        const storybook = await storybookOrchestrator.generateStorybook(chapterId);

        logger.info('Storybook fetched for reader', {
            traceId,
            chapterId,
            title: storybook.title,
            pageCount: storybook.scenes.length
        });

        return NextResponse.json({
            id: storybook.id,
            title: storybook.title,
            scenes: storybook.scenes.map(scene => ({
                pageNumber: scene.pageNumber,
                text: scene.storyText,
                visualPrompt: scene.imagePrompt,
                moment: scene.moment,
                generatedImageUrl: scene.image ? `data:${scene.image.mimeType};base64,${scene.image.base64}` : null
            })),
            metadata: {
                characterName: storybook.metadata.characterName,
                timePeriod: storybook.metadata.timePeriod,
                totalPages: storybook.scenes.length
            }
        });

    } catch (error: any) {
        logger.error('Failed to fetch storybook', {
            traceId,
            chapterId,
            error: error.message
        });

        return NextResponse.json(
            { error: 'Failed to load storybook', details: error.message },
            { status: 500 }
        );
    }
}
