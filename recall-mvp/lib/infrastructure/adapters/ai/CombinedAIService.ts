import { AIServicePort } from '../../../core/application/ports/AIServicePort';
import OpenAI from 'openai';
import { ElevenLabsClient } from 'elevenlabs';

export class CombinedAIService implements AIServicePort {
  private openai: OpenAI;
  private elevenLabs: ElevenLabsClient;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'mock-key',
    });
    this.elevenLabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY || 'mock-key',
    });
  }

  private async retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.retry(fn, retries - 1, delay * 2);
    }
  }

  async generateQuestion(
    userUtterance: string,
    history: any[],
    memories: any[]
  ): Promise<{ text: string; strategy: string }> {
    try {
        return await this.retry(async () => {
            if (!process.env.OPENAI_API_KEY) {
                // Mock behavior if no key
                return { text: "That's interesting, tell me more.", strategy: "sensory_deepening" };
            }

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are an empathetic interviewer.' },
                    { role: 'user', content: userUtterance }
                ]
            });

            return {
                text: response.choices[0].message.content || "Tell me more.",
                strategy: "sensory_deepening"
            };
        });
    } catch (error) {
        console.error("Failed to generate question after retries:", error);
        // Fallback
        return { text: "I see. Please go on.", strategy: "fallback_generic" };
    }
  }

  async generateChapterAnalysis(transcript: string): Promise<any> {
      try {
        return await this.retry(async () => {
             if (!process.env.OPENAI_API_KEY) {
                return { title: "Mock Title", entities: [], tone: "neutral", period: "1950s" };
            }

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: `Analyze this transcript: ${transcript}` }],
                response_format: { type: 'json_object' }
            });
            return JSON.parse(response.choices[0].message.content || '{}');
        });
      } catch (error) {
          console.error("Failed to generate chapter analysis:", error);
          return { title: "New Chapter", entities: [], tone: "neutral", period: "Unknown" };
      }
  }

  async generateChapterNarrative(transcript: string, analysis: any): Promise<{ content: string; wordCount: number }> {
      try {
          return await this.retry(async () => {
            if (!process.env.OPENAI_API_KEY) {
                return { content: "Mock chapter content...", wordCount: 300 };
            }
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: `Write a chapter based on ${transcript}` }]
            });
            const content = response.choices[0].message.content || '';
            return { content, wordCount: content.split(' ').length };
          });
      } catch (error) {
           console.error("Failed to generate narrative:", error);
           return { content: "We couldn't generate the story right now. Please try again later.", wordCount: 10 };
      }
  }

  async startVoiceConversation(userId: string, sessionId: string, userName: string, memories: any[]): Promise<{ agentId: string; conversationId: string; wsUrl?: string }> {
      try {
          return await this.retry(async () => {
            if (!process.env.ELEVENLABS_API_KEY) {
                return { agentId: "mock-agent", conversationId: "mock-conv-id", wsUrl: "wss://mock.elevenlabs.io" };
            }
            const conversation = await this.elevenLabs.conversationalAI.startConversation({
                agentId: process.env.ELEVENLABS_AGENT_ID!,
                metadata: { userId, sessionId }
            });
            return { agentId: conversation.agentId, conversationId: conversation.conversationId };
          });
      } catch (error) {
          console.error("Failed to start voice conversation:", error);
          throw error; // Re-throw as frontend needs to know to show error UI
      }
  }
}
