import { SpeechPort } from '../../../core/application/ports/SpeechPort';
import { VoiceAgentPort } from '../../../core/application/ports/VoiceAgentPort';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { OpenAI } from 'openai';

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
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
         // Placeholder for OpenAI logic if needed
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
