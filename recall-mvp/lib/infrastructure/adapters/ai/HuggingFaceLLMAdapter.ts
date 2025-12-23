/**
 * HuggingFace LLM Adapter - FREE LLM inference.
 * 
 * Uses HuggingFace Inference API with free models:
 * - Mistral-7B-Instruct (good balance of speed/quality)
 * - Llama-3-8B-Instruct (excellent quality)
 * - Phi-3-mini (fast, good for simple tasks)
 * 
 * Free tier: Unlimited with rate limiting
 * 
 * @module HuggingFaceLLMAdapter
 */

import { LLMPort } from '../../../core/application/ports/LLMPort';

interface HFResponse {
    generated_text?: string;
    [key: number]: { generated_text: string };
}

export class HuggingFaceLLMAdapter implements LLMPort {
    private apiKey: string;
    private baseUrl = 'https://api-inference.huggingface.co/models';
    // Default to Mistral - good balance of quality and speed
    private defaultModel = 'mistralai/Mistral-7B-Instruct-v0.2';

    constructor() {
        this.apiKey = process.env.HUGGINGFACE_API_KEY || '';
        if (!this.apiKey) {
            console.warn('[HuggingFaceLLMAdapter] No HUGGINGFACE_API_KEY set');
        }
    }

    private async callHuggingFace(prompt: string, model?: string): Promise<string> {
        const modelId = model || this.defaultModel;
        const url = `${this.baseUrl}/${modelId}`;

        // Format prompt for instruction-tuned models
        const formattedPrompt = this.formatPrompt(prompt, modelId);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: formattedPrompt,
                    parameters: {
                        max_new_tokens: 2048,
                        temperature: 0.7,
                        return_full_text: false,
                        do_sample: true,
                    },
                    options: {
                        wait_for_model: true,
                    }
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                // Handle model loading (503)
                if (response.status === 503) {
                    console.log('[HuggingFaceLLMAdapter] Model is loading, waiting...');
                    await new Promise(resolve => setTimeout(resolve, 20000));
                    return this.callHuggingFace(prompt, model);
                }
                throw new Error(`HuggingFace API error: ${response.status} - ${error}`);
            }

            const data: HFResponse | HFResponse[] = await response.json();

            // Handle array response
            if (Array.isArray(data)) {
                return data[0]?.generated_text || '';
            }
            return data.generated_text || '';
        } catch (e) {
            console.error('[HuggingFaceLLMAdapter] API call failed:', e);
            throw e;
        }
    }

    private formatPrompt(prompt: string, model: string): string {
        // Format for Mistral
        if (model.includes('Mistral')) {
            return `<s>[INST] ${prompt} [/INST]`;
        }
        // Format for Llama
        if (model.includes('Llama') || model.includes('llama')) {
            return `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;
        }
        // Default
        return prompt;
    }

    async generateText(
        prompt: string,
        options?: { model?: string; maxTokens?: number; temperature?: number }
    ): Promise<string> {
        if (!this.apiKey) {
            console.warn('[HuggingFaceLLMAdapter] No API key, returning mock response');
            return 'Mock response - Set HUGGINGFACE_API_KEY for real LLM responses';
        }
        return this.callHuggingFace(prompt, options?.model);
    }

    async generateJson<T>(
        prompt: string,
        _schema?: any,
        options?: { model?: string; maxTokens?: number; temperature?: number }
    ): Promise<T> {
        if (!this.apiKey) {
            console.warn('[HuggingFaceLLMAdapter] No API key, returning mock JSON');
            return {} as T;
        }

        const jsonPrompt = `${prompt}

IMPORTANT: Respond with ONLY valid JSON. No explanations, no markdown. Just the JSON object.`;

        const text = await this.callHuggingFace(jsonPrompt, options?.model);

        try {
            // Try to extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]) as T;
            }
            // Try parsing as-is
            return JSON.parse(text.trim()) as T;
        } catch (e) {
            console.error('[HuggingFaceLLMAdapter] Failed to parse JSON:', text);
            // Return empty object as fallback
            return {} as T;
        }
    }

    async analyzeImage(
        _imageBase64: string,
        _mimeType: string,
        _prompt: string,
        _options?: { model?: string }
    ): Promise<string> {
        // HuggingFace free tier doesn't support vision well
        // Return a helpful message
        console.warn('[HuggingFaceLLMAdapter] Image analysis not supported. Use Google AI Studio for vision.');
        return 'Image analysis requires Google AI Studio. Set GOOGLE_AI_API_KEY for vision features.';
    }
}
