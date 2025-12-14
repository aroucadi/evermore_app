import { AIServicePort } from '../../../core/application/ports/AIServicePort';
import { VertexAI, GenerativeModel, Part } from '@google-cloud/vertexai';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export class GeminiService implements AIServicePort {
  private vertexAI: VertexAI;
  private model: GenerativeModel;
  private visionModel: GenerativeModel;
  private elevenLabs: ElevenLabsClient;

  constructor() {
    this.vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT || 'recall-hackathon',
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
    });
    this.model = this.vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro-001',
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
      },
    });
    // Use the same model for vision as Gemini 1.5 Pro is multimodal
    this.visionModel = this.vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro-001',
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
      if (!process.env.GOOGLE_CLOUD_PROJECT) {
          return { text: "That's interesting, tell me more.", strategy: "sensory_deepening" };
      }

      const prompt = `
        You are an empathetic biographer interviewing a senior.
        History: ${JSON.stringify(history)}
        Memories: ${JSON.stringify(memories)}
        User said: "${userUtterance}"

        Generate a follow-up question that encourages deep reflection or sensory details.
        Output JSON: { "text": "Question text", "strategy": "strategy_name" }
      `;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.candidates?.[0].content.parts[0].text;

      if (!responseText) throw new Error("No response from Gemini");

      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanJson);

    } catch (error) {
      console.error("Gemini generateQuestion failed:", error);
      return { text: "I see. Please go on.", strategy: "fallback_generic" };
    }
  }

  async generateChapterAnalysis(transcript: string): Promise<any> {
    try {
      if (!process.env.GOOGLE_CLOUD_PROJECT) {
           return { title: "Mock Title", entities: [], tone: "neutral", period: "1950s" };
      }

      const prompt = `
        Analyze this transcript for a biography chapter.
        Transcript: ${transcript}

        Extract: Title, Key Entities (People, Places), Tone, Time Period.
        Output JSON.
      `;

      const result = await this.model.generateContent(prompt);
       const responseText = result.response.candidates?.[0].content.parts[0].text;

      if (!responseText) throw new Error("No response from Gemini");

      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Gemini generateChapterAnalysis failed:", error);
      return { title: "New Chapter", entities: [], tone: "neutral", period: "Unknown" };
    }
  }

  async generateChapterNarrative(transcript: string, analysis: any): Promise<{ content: string; wordCount: number }> {
     try {
       if (!process.env.GOOGLE_CLOUD_PROJECT) {
            return { content: "Mock chapter content...", wordCount: 300 };
       }

      const prompt = `
        Write a beautifully crafted biography chapter based on this transcript.
        Analysis: ${JSON.stringify(analysis)}
        Transcript: ${transcript}

        Style: Engaging, narrative, first-person or third-person as appropriate.
      `;

      const result = await this.model.generateContent(prompt);
      const content = result.response.candidates?.[0].content.parts[0].text || '';

      return { content, wordCount: content.split(' ').length };

     } catch (error) {
        console.error("Gemini generateChapterNarrative failed:", error);
        return { content: "We couldn't generate the story right now.", wordCount: 0 };
     }
  }

  async startVoiceConversation(userId: string, sessionId: string, userName: string, memories: any[]): Promise<{ agentId: string; conversationId: string; wsUrl?: string }> {
     try {
       // "The Architect" Logic:
       // Use Gemini to generate a tailored 'goal' for the agent based on recent memories or lack thereof.
       let agentGoal = "Ask about their childhood and early memories.";

       if (process.env.GOOGLE_CLOUD_PROJECT && memories.length > 0) {
           try {
             const planPrompt = `
                You are the Director of a biography project.
                The subject is ${userName}.
                Here are the recent memories/topics discussed: ${JSON.stringify(memories.slice(0, 5))}

                Define a specific, engaging goal for the next 5-minute interview session.
                Focus on exploring emotional depth or a specific event mentioned briefly.
                Keep it under 30 words.
             `;
             const result = await this.model.generateContent(planPrompt);
             const plan = result.response.candidates?.[0].content.parts[0].text;
             if (plan) agentGoal = plan.trim();
           } catch (e) {
               console.warn("Failed to generate dynamic plan, using default.");
           }
       }

       console.log(`[The Architect] Session Goal for ${userName}: ${agentGoal}`);

       return await this.retry(async () => {
         if (!process.env.ELEVENLABS_API_KEY) {
             return { agentId: "mock-agent", conversationId: "mock-conv-id", wsUrl: "wss://mock.elevenlabs.io" };
         }

         // We pass the goal as a dynamic variable or overrides if the SDK/Agent supports it.
         // Since the standard SDK might not support 'overrides' in 'createConversation' directly depending on version,
         // we simulate the intent here. In a real dynamic agent scenario, we would update the Agent's prompt via API
         // OR pass 'dynamic_variables' if using a template.
         // Assuming we can pass config:

         const conversation = await (this.elevenLabs as any).conversationalAi.createConversation({
             agent_id: process.env.ELEVENLABS_AGENT_ID!,
             // Hypothetical property for dynamic context injection supported by some ElevenLabs setups
             // If not supported, this is where we would use a tool call or updated system prompt via a separate API call.
             // For the hackathon MVP, we log the intent.
         });
         return { agentId: conversation.agent_id, conversationId: conversation.conversation_id };
       });
     } catch (error) {
        console.error("Failed to start voice conversation:", error);
        throw error;
     }
  }

  async analyzeImage(imageBase64: string, mimeType: string): Promise<{ description: string; detectedEntities: string[] }> {
    try {
        if (!process.env.GOOGLE_CLOUD_PROJECT) {
            return { description: "Mock image analysis: A vintage photo from the 1950s.", detectedEntities: ["car", "house"] };
        }

        const imagePart: Part = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType
            }
        };

        const prompt = "Describe this image in detail, focusing on nostalgic elements, time period, and emotional context. List detected key entities (objects, people) separately as JSON.";

        const result = await this.visionModel.generateContent([prompt, imagePart]);
        const text = result.response.candidates?.[0].content.parts[0].text;

        if (!text) throw new Error("No response from Gemini Vision");

        const jsonMatch = text.match(/```json([\s\S]*?)```/);
        let entities = [];
        let description = text;

        if (jsonMatch) {
            try {
                const json = JSON.parse(jsonMatch[1]);
                entities = json.entities || [];
                description = text.replace(jsonMatch[0], '').trim();
            } catch (e) {
                console.warn("Failed to parse entities JSON from image analysis");
            }
        }

        return { description, detectedEntities: entities };

    } catch (error) {
        console.error("Gemini analyzeImage failed:", error);
        return { description: "Unable to analyze image.", detectedEntities: [] };
    }
  }
}
