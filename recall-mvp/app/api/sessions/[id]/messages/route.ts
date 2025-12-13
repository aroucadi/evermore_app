
import { db } from '@/lib/db';
import { sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Mock services for now
const mockAgent = {
  generateNextQuestion: async (message: string, context: any) => {
    const responses = [
      "That's a wonderful memory. Can you tell me more about what that was like?",
      "I can almost picture it. What stands out most to you about that time?",
      "That's really interesting. How did that make you feel?",
      "I'd love to hear more details. What else do you remember?",
      "That sounds special. Who else was there with you?"
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      strategy: 'mock_strategy'
    };
  }
};
const mockMemoryService = {
  retrieveContext: async (userId: string, message: string) => {
    return [];
  }
};


export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { message, speaker } = await req.json();
    const sessionId = params.id;

    // Get session from DB
    const [session] = await db.select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!session) {
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
      const context = await mockMemoryService.retrieveContext(
        session.userId,
        message
      );

      // Generate agent response
      const response = await mockAgent.generateNextQuestion(message, {
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
      await db.update(sessions)
        .set({ transcriptRaw: JSON.stringify(transcript) })
        .where(eq(sessions.id, sessionId));

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
