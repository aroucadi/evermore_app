import { NextResponse } from 'next/server';
import { db } from '@/lib/infrastructure/adapters/db';
import { chapters } from '@/lib/infrastructure/adapters/db/schema';
import { eq } from 'drizzle-orm';
import { DrizzleChapterRepository } from '@/lib/infrastructure/adapters/db/DrizzleChapterRepository';
import { StorybookService } from '@/lib/infrastructure/adapters/storybook/StorybookService';
import { CombinedAIService } from '@/lib/infrastructure/adapters/ai/CombinedAIService';

// Factory for service
function getStorybookService() {
    const chapterRepo = new DrizzleChapterRepository();
    const aiService = new CombinedAIService();
    return new StorybookService(chapterRepo, aiService);
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
     try {
        const { id } = await params;
        // Check if storybook exists (mock check, or implement DB check)
        // For MVP, we might regenerate or check cache.
        // The frontend calls this to get the storybook.

        // If we want to trigger generation:
        const service = getStorybookService();
        const result = await service.generateStorybook(id);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Storybook generation error:", error);
        return NextResponse.json({ error: "Failed to generate storybook" }, { status: 500 });
    }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = getStorybookService();
    const result = await service.generateStorybook(id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating storybook:', error);
    return NextResponse.json(
      { error: 'Failed to generate storybook' },
      { status: 500 }
    );
  }
}
