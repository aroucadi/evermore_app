import { LLMPort } from '../../../core/application/ports/LLMPort';
import { VertexAI, GenerativeModel, Part } from '@google-cloud/vertexai';
import { JsonParser } from '../../../core/application/utils/JsonParser';

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

    private getModel(modelId?: string): GenerativeModel {
        return this.vertexAI.getGenerativeModel({
            model: modelId || 'gemini-1.5-pro-001',
            generationConfig: {
                maxOutputTokens: 8192,
                temperature: 0.7,
            },
        });
    }

    async generateText(prompt: string, options?: { model?: string; maxTokens?: number; temperature?: number }): Promise<string> {
        try {
            if (!process.env.GOOGLE_CLOUD_PROJECT && !process.env.CI) {
                console.warn("GoogleVertexAdapter: No GOOGLE_CLOUD_PROJECT set. Returning mock response.");
                return "Mock Text Response (Set GOOGLE_CLOUD_PROJECT to enable)";
            }

            const model = this.getModel(options?.model);
            const result = await model.generateContent({
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

    async generateJson<T>(prompt: string, schema?: any, options?: { model?: string; maxTokens?: number; temperature?: number }): Promise<T> {
        // Use JSON mode if model supports it (Gemini 1.5 Pro does)
        const jsonModel = this.vertexAI.getGenerativeModel({
            model: options?.model || 'gemini-1.5-pro-001',
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
            // Even in JSON mode, we might get unexpected wrapping
            return JsonParser.parse<T>(text);
        } catch (e) {
            console.warn("GoogleVertexAdapter: JSON mode failed or parsing error", e);
            // Fallback: Force text mode with explicit instruction
            const text = await this.generateText(`${prompt}\n\nOutput strictly valid JSON.`, options);
            try {
                return JsonParser.parse<T>(text);
            } catch (parseError) {
                console.error("GoogleVertexAdapter: Failed to parse JSON", text);
                throw new Error("Failed to parse JSON from LLM: " + text.substring(0, 100));
            }
        }
    }

    async analyzeImage(imageBase64: string, mimeType: string, prompt: string, options?: { model?: string }): Promise<string> {
        if (!process.env.GOOGLE_CLOUD_PROJECT && !process.env.CI) return "Mock Image Analysis";

        try {
            const imagePart: Part = { inlineData: { data: imageBase64, mimeType: mimeType } };
            const model = this.getModel(options?.model);
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }, imagePart] }]
            });
            return result.response.candidates?.[0].content.parts[0].text || "";
        } catch (e) {
            console.error("GoogleVertexAdapter analyzeImage failed", e);
            throw e;
        }
    }
}
