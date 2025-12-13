
import { OpenAIClient } from '@/lib/services/openai/OpenAIClient';
import { db } from '@/lib/db';
import { chapters, sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Message } from '@/lib/types';

export class BiographerAgent {
  private openai: OpenAIClient;

  constructor() {
    this.openai = new OpenAIClient();
  }

  async generateChapter(sessionId: string): Promise<string> {
    // 1. Load session transcript
    const [session] = await db.select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!session) throw new Error('Session not found');

    const transcript = JSON.parse(session.transcriptRaw || '[]');

    // 2. Analyze session
    const analysis = await this.analyzeSession(transcript);

    // 3. Generate narrative
    const narrative = await this.generateNarrative(transcript, analysis);

    // 4. Create chapter in DB
    const [chapter] = await db.insert(chapters).values({
      sessionId,
      userId: session.userId,
      title: analysis.title,
      content: narrative.content,
      excerpt: narrative.content.substring(0, 150) + '...',
      entities: analysis.entities,
      metadata: {
        sessionNumber: analysis.sessionNumber,
        wordCount: narrative.wordCount,
        emotionalTone: analysis.tone,
        lifePeriod: analysis.period
      }
    }).returning();

    return chapter.id;
  }

  private async analyzeSession(transcript: Message[]) {
    const fullText = transcript.map(m => m.text).join('\n');

    const prompt = `Analyze this conversation transcript and extract:
1. Primary narrative arc (one-line summary)
2. Key entities (people, places, topics mentioned)
3. Emotional tone (positive/neutral/bittersweet/melancholic)
4. Life period (e.g., "1950s", "Navy Years", "Childhood")

Transcript:
${fullText}

Return JSON with: { "title", "entities": [{"type", "name", "mentions"}], "tone", "period" }`;

    const response = await this.openai.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content as string);
  }

  private async generateNarrative(transcript: Message[], analysis: any) {
    const userMessages = transcript.filter(m => m.speaker === 'user');
    const fullText = userMessages.map(m => m.text).join('\n');

    const prompt = `Generate a biographical chapter from this conversation.

TITLE: ${analysis.title}

TRANSCRIPT:
${fullText}

REQUIREMENTS:
1. Structure: Opening paragraph (context) → Body (2-3 paragraphs with narrative) → Closing (reflection)
2. Include 1-2 verbatim quotes in italics
3. Word count: 300-500 words
4. CRITICAL: Zero fabrication - every claim must trace to transcript
5. Write in warm, literary style

OUTPUT FORMAT:
# ${analysis.title}

[Chapter content]`;

    const response = await this.openai.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content as string;

    return {
      content,
      wordCount: content.split(/\s+/).length
    };
  }
}
