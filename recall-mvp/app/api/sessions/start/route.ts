
import { db } from '@/lib/db';
import { sessions } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    // Create session in DB
    const [session] = await db.insert(sessions).values({
      userId,
      status: 'active',
      startedAt: new Date(),
      transcriptRaw: '[]'
    }).returning();

    // TODO: Initialize ElevenLabs conversation

    return NextResponse.json({
      sessionId: session.id,
      userId: session.userId,
      startedAt: session.startedAt,
    });
  } catch (error) {
    console.error('Error starting session:', error);
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    );
  }
}
