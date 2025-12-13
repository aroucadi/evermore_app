
import { ConversationalistAgent } from '@/lib/services/conversationalist/ConversationalistAgent';
import { MemoryService } from '@/lib/services/memory/MemoryService';
import { db } from '@/lib/db';
import { sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { message, speaker } = await req.json();
    const sessionId = (await params).id;

    // Get session from DB
    let session: any;
    try {
        const result = await db.select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);
        session = result[0];
    } catch (e) {
         console.warn("DB select failed, using mock session");
         session = {
            id: sessionId,
            userId: 'mock-user-id',
            transcriptRaw: '[]'
         };
    }

    if (!session && !session.id.startsWith('mock')) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Parse current transcript
    const transcript = JSON.parse(session.transcriptRaw || '[]');

    // Add user message to transcript
    transcript.push({
      id: `msg-${Date.now()}`,
      speaker,
      text: message,
      timestamp: new Date().toISOString()
    });

    // If user message, generate agent response
    if (speaker === 'user') {
      // Load conversation context
      const memoryService = new MemoryService();
      const context = await memoryService.retrieveContext(
        session.userId,
        message
      );

      // Generate agent response
      const agent = new ConversationalistAgent();
      const response = await agent.generateNextQuestion(message, {
        userId: session.userId,
        sessionId: session.id,
        history: transcript,
        memories: context
      });

      // Add agent response to transcript
      transcript.push({
        id: `msg-${Date.now() + 1}`,
        speaker: 'agent',
        text: response.text,
        timestamp: new Date().toISOString(),
        strategy: response.strategy
      });

      // Update session in DB
      try {
        await db.update(sessions)
            .set({ transcriptRaw: JSON.stringify(transcript) })
            .where(eq(sessions.id, sessionId));
      } catch (e) {
          console.warn("DB update failed (transcript)");
      }

      return NextResponse.json({
        id: `msg-${Date.now() + 1}`,
        speaker: 'agent',
        text: response.text,
        timestamp: new Date().toISOString(),
        strategy: response.strategy
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
