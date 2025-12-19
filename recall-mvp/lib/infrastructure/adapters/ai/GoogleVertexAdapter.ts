import { LLMPort } from '../../../core/application/ports/LLMPort';
import { VertexAI, GenerativeModel, Part } from '@google-cloud/vertexai';

export class GoogleVertexAdapter implements LLMPort {
  private vertexAI: VertexAI;
  private model: GenerativeModel;
  private visionModel: GenerativeModel;

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
    this.visionModel = this.vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro-001',
    });
  }

  async generateText(prompt: string, options?: { maxTokens?: number; temperature?: number }): Promise<string> {
      try {
          if (!process.env.GOOGLE_CLOUD_PROJECT) return "Mock Text Response";

          const result = await this.model.generateContent({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                  maxOutputTokens: options?.maxTokens,
                  temperature: options?.temperature
              }
          });
          return result.response.candidates?.[0].content.parts[0].text || "";
      } catch (e) {
          console.error("GoogleVertexAdapter generateText failed", e);
          throw e;
      }
  }

  async generateJson<T>(prompt: string, schema?: any, options?: { maxTokens?: number; temperature?: number }): Promise<T> {
     const jsonPrompt = `${prompt}\n\nOutput strictly valid JSON. Do not include markdown formatting like \`\`\`json.`;
     const text = await this.generateText(jsonPrompt, options);
     try {
         const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
         return JSON.parse(cleanJson) as T;
     } catch (e) {
         console.error("GoogleVertexAdapter generateJson failed to parse", text, e);
         throw new Error("Failed to parse JSON from LLM");
     }
  }

  async analyzeImage(imageBase64: string, mimeType: string, prompt: string): Promise<string> {
      if (!process.env.GOOGLE_CLOUD_PROJECT) return "Mock Image Analysis";

      const imagePart: Part = { inlineData: { data: imageBase64, mimeType: mimeType } };
      const result = await this.visionModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }, imagePart] }]
      });
      return result.response.candidates?.[0].content.parts[0].text || "";
  }
}
