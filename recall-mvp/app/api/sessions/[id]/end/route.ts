
import { db } from '@/lib/db';
import { sessions, jobs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    // Update session status
    await db.update(sessions)
      .set({
        status: 'completed',
        endedAt: new Date()
      })
      .where(eq(sessions.id, sessionId));

    // Queue chapter generation job
    const [job] = await db.insert(jobs).values({
      type: 'chapter_generation',
      status: 'pending',
      payload: { sessionId }
    }).returning();

    return NextResponse.json({
      success: true,
      sessionId,
      jobId: job.id,
      estimatedCompletionTime: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}
