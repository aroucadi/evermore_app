import { startSessionUseCase } from '@/lib/infrastructure/di/container';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    const result = await startSessionUseCase.execute(userId);

    return NextResponse.json({
      sessionId: result.session.id,
      userId: result.session.userId,
      startedAt: result.session.startedAt,
      elevenLabsConfig: result.aiConfig
    });
  } catch (error) {
    console.error('Error starting session:', error);
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    );
  }
}
