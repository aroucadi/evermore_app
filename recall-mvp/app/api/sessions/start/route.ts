
import { db } from '@/lib/db';
import { sessions } from '@/lib/db/schema';
import { ElevenLabsClient } from '@/lib/services/elevenlabs/ElevenLabsClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    // Create session in DB
    let session: any;
    try {
        const result = await db.insert(sessions).values({
            userId,
            status: 'active',
            startedAt: new Date(),
            transcriptRaw: '[]'
        }).returning();
        session = result[0];
    } catch (e) {
        console.warn("DB insert session failed, using mock session");
        session = {
            id: `mock-session-${Date.now()}`,
            userId,
            startedAt: new Date(),
        };
    }

    // Initialize ElevenLabs conversation
    const elevenLabs = new ElevenLabsClient();
    const conversationConfig = await elevenLabs.startConversation({
      userId,
      sessionId: session.id,
      userName: 'User' // Ideally fetch user name from DB
    });

    return NextResponse.json({
      sessionId: session.id,
      userId: session.userId,
      startedAt: session.startedAt,
      elevenLabsConfig: conversationConfig
    });
  } catch (error) {
    console.error('Error starting session:', error);
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    );
  }
}
