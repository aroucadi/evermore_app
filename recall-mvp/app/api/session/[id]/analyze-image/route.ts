import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeSessionImageUseCase } from '@/lib/core/application/use-cases/AnalyzeSessionImageUseCase';
import { GeminiService } from '@/lib/infrastructure/adapters/ai/GeminiService';
import { PineconeStore } from '@/lib/infrastructure/adapters/vector/PineconeStore';
import { DrizzleSessionRepository } from '@/lib/infrastructure/adapters/db/DrizzleSessionRepository';
import { db } from '@/lib/infrastructure/adapters/db';

// Composition Root (Manual DI for now)
const aiService = new GeminiService();
// We need to instantiate dependencies properly.
// Assuming PineconeStore and DrizzleSessionRepository have straightforward constructors or factories.
// Note: In a real app, use the container.ts
const sessionRepository = new DrizzleSessionRepository();
const vectorStore = new PineconeStore(sessionRepository); // Ensure this constructor is valid or use container

const useCase = new AnalyzeSessionImageUseCase(sessionRepository, aiService, vectorStore);

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const mimeType = file.type;

    const result = await useCase.execute(id, base64, mimeType);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
