import { LLMPort } from '../../../core/application/ports/LLMPort';
import { VertexAI, GenerativeModel, Part } from '@google-cloud/vertexai';

export class GoogleVertexAdapter implements LLMPort {
  private vertexAI: VertexAI;
  private model: GenerativeModel;
  private visionModel: GenerativeModel;

  constructor() {
    const project = process.env.GOOGLE_CLOUD_PROJECT || 'recall-hackathon';
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

    this.vertexAI = new VertexAI({
      project,
      location,
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
          if (!process.env.GOOGLE_CLOUD_PROJECT && !process.env.CI) {
             console.warn("GoogleVertexAdapter: No GOOGLE_CLOUD_PROJECT set. Returning mock response.");
             return "Mock Text Response (Set GOOGLE_CLOUD_PROJECT to enable)";
          }

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
          throw e; // Propagate error so caller knows it failed
      }
  }

  async generateJson<T>(prompt: string, schema?: any, options?: { maxTokens?: number; temperature?: number }): Promise<T> {
     // Use Gemini's native JSON mode
     const jsonModel = this.vertexAI.getGenerativeModel({
         model: 'gemini-1.5-pro-001',
         generationConfig: {
             responseMimeType: "application/json",
             maxOutputTokens: options?.maxTokens || 8192,
             temperature: options?.temperature || 0.5
         }
     });

     try {
         const result = await jsonModel.generateContent({
             contents: [{ role: 'user', parts: [{ text: prompt }] }]
         });

         const text = result.response.candidates?.[0].content.parts[0].text || "{}";
         return JSON.parse(text) as T;
     } catch (e) {
         // Fallback to text generation + parsing if JSON mode fails or model doesn't support it in this region
         console.warn("GoogleVertexAdapter: JSON mode failed, falling back to text parsing", e);
         const text = await this.generateText(`${prompt}\n\nOutput strictly valid JSON.`, options);
         try {
             const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
             return JSON.parse(cleanJson) as T;
         } catch (parseError) {
             console.error("GoogleVertexAdapter: Failed to parse JSON", text);
             throw new Error("Failed to parse JSON from LLM");
         }
     }
  }

  async analyzeImage(imageBase64: string, mimeType: string, prompt: string): Promise<string> {
      if (!process.env.GOOGLE_CLOUD_PROJECT && !process.env.CI) return "Mock Image Analysis";

      try {
        const imagePart: Part = { inlineData: { data: imageBase64, mimeType: mimeType } };
        const result = await this.visionModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }, imagePart] }]
        });
        return result.response.candidates?.[0].content.parts[0].text || "";
      } catch (e) {
          console.error("GoogleVertexAdapter analyzeImage failed", e);
          throw e;
      }
  }
}
