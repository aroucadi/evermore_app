import { SpeechPort } from '../../../core/application/ports/SpeechPort';
import { VoiceAgentPort } from '../../../core/application/ports/VoiceAgentPort';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { OpenAI } from 'openai';
import { Readable } from 'stream';

export class ElevenLabsAdapter implements SpeechPort, VoiceAgentPort {
  private client: ElevenLabsClient;
  private openai: OpenAI | null = null;
  private sttFallback: SpeechPort | null = null;

  constructor(sttFallback?: SpeechPort) {
    this.client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY || 'mock-key',
    });

    if (sttFallback) {
        this.sttFallback = sttFallback;
    }

    if (process.env.OPENAI_API_KEY) {
        // dangerouslyAllowBrowser: true is needed because Vitest runs in JSDOM (browser-like) environment.
        // In real Node.js server environment, this check is skipped by OpenAI SDK, but we add it for safety in tests.
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            dangerouslyAllowBrowser: process.env.NODE_ENV === 'test'
        });
    }
  }

  async textToSpeech(text: string, style?: string): Promise<Buffer> {
      if (!process.env.ELEVENLABS_API_KEY) {
          console.warn("ElevenLabsAdapter: No API Key, using mock audio.");
          return Buffer.from("mock-audio-mp3");
      }

      try {
        const stability = style === 'emotional' ? 0.35 : 0.7;
        const response = await this.client.textToSpeech.convert(
            process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB',
            {
                text,
                model_id: 'eleven_turbo_v2_5',
                voice_settings: { stability, similarity_boost: 0.75 }
            } as any
        );
        const chunks: Buffer[] = [];
        for await (const chunk of (response as any)) { chunks.push(Buffer.from(chunk)); }
        return Buffer.concat(chunks);
      } catch (error) {
          console.error("ElevenLabs TTS failed", error);
          throw error;
      }
  }

  async speechToText(audioBuffer: Buffer, contentType: string): Promise<string> {
      // 1. Try OpenAI Whisper if configured (optional internal logic)
      if (this.openai) {
        try {
          // Convert Buffer to File-like object for OpenAI
          const file = await this.bufferToFile(audioBuffer, 'audio.webm', contentType);
          const transcription = await this.openai.audio.transcriptions.create({
            file: file,
            model: "whisper-1",
          });
          return transcription.text;
        } catch (e) {
             console.warn("ElevenLabsAdapter: OpenAI Whisper failed, falling back.", e);
        }
      }

      // 2. Use Injected Fallback (HuggingFace)
      if (this.sttFallback) {
          try {
              return await this.sttFallback.speechToText(audioBuffer, contentType);
          } catch (e) {
              console.error("ElevenLabsAdapter: STT Fallback failed", e);
          }
      }

      throw new Error("Speech to text failed: No working provider available (ElevenLabs requires fallback for STT).");
  }

  // Helper to convert Buffer to a File object compatible with OpenAI SDK
  private async bufferToFile(buffer: Buffer, filename: string, contentType: string): Promise<any> {
      // In Node environment for OpenAI SDK, we might need to pass a ReadStream or similar
      // simpler hack: create a File object if in environment that supports it, or pass stream
      // Vitest/Node:
      return Object.assign(Readable.from(buffer), {
          path: filename,
          name: filename,
          lastModified: Date.now()
      });
  }

  async startConversation(
    userId: string,
    sessionId: string,
    userName: string,
    context: { goal: string; memories: any[]; imageContext?: string }
  ): Promise<{ agentId: string; conversationId: string; wsUrl?: string }> {
      if (!process.env.ELEVENLABS_API_KEY) {
          return { agentId: "mock-agent", conversationId: "mock-conv", wsUrl: "ws://localhost:3000/mock-ws" };
      }

      try {
         const conversation = await (this.client as any).conversationalAi.createConversation({
             agent_id: process.env.ELEVENLABS_AGENT_ID!,
             conversation_config_override: {
                 agent: {
                     prompt: {
                         first_message: `Hi ${userName}, I'm Recall. ${context.goal}`
                     }
                 }
             },
             dynamic_variables: {
                 user_name: userName,
                 session_goal: context.goal
             }
         });
         return { agentId: conversation.agent_id, conversationId: conversation.conversation_id };
      } catch (error) {
          console.error("ElevenLabs StartConversation failed", error);
          throw error;
      }
  }
}
