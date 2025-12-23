/**
 * Google AI Studio Adapter - FREE Gemini API access with production safety.
 * 
 * Uses Google AI Studio API (not Vertex AI) which has a generous free tier:
 * - Gemini 1.5 Flash: 1,500 requests/day FREE
 * - Gemini 2.0 Flash: 250 requests/day FREE
 * 
 * Production features:
 * - Request timeouts (prevents hung requests)
 * - Token usage tracking
 * - Graceful error handling
 * 
 * Get your FREE API key at: https://aistudio.google.com/apikey
 * 
 * @module GoogleAIStudioAdapter
 */

import { LLMPort } from '../../../core/application/ports/LLMPort';
import { llmUsageTracker } from '../../../core/application/services/LLMUsageTracker';
import { logger } from '../../../core/application/Logger';
import { JsonParser } from '../../../core/application/utils/JsonParser';

interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{ text: string }>;
        };
    }>;
    usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
    };
}

// Production timeouts
const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds
const IMAGE_TIMEOUT_MS = 60000; // 60 seconds for image analysis

export class GoogleAIStudioAdapter implements LLMPort {
    private apiKey: string;
    private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    private defaultModel = 'gemini-1.5-flash';

    constructor() {
        this.apiKey = process.env.GOOGLE_AI_API_KEY || '';
        if (!this.apiKey) {
            logger.warn('GoogleAIStudioAdapter: No GOOGLE_AI_API_KEY set', {
                hint: 'Get one FREE at https://aistudio.google.com/apikey'
            });
        }
    }

    /**
     * Fetch with timeout support.
     */
    private async fetchWithTimeout(
        url: string,
        options: RequestInit,
        timeoutMs: number = DEFAULT_TIMEOUT_MS
    ): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            return response;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private async callGemini(
        prompt: string,
        options?: {
            model?: string;
            maxTokens?: number;
            temperature?: number;
            responseType?: 'text' | 'json';
            userId?: string;
            purpose?: string;
        }
    ): Promise<string> {
        const model = options?.model || this.defaultModel;
        const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
        const requestId = crypto.randomUUID();
        const startTime = Date.now();

        const body: any = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: options?.maxTokens || 8192,
                temperature: options?.temperature || 0.7,
            }
        };

        // Request JSON response format if specified
        if (options?.responseType === 'json') {
            body.generationConfig.responseMimeType = 'application/json';
        }

        try {
            const response = await this.fetchWithTimeout(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            }, DEFAULT_TIMEOUT_MS);

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Gemini API error: ${response.status} - ${error}`);
            }

            const data: GeminiResponse = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const durationMs = Date.now() - startTime;

            // Track usage
            const inputTokens = data.usageMetadata?.promptTokenCount ||
                llmUsageTracker.estimateTokens(prompt);
            const outputTokens = data.usageMetadata?.candidatesTokenCount ||
                llmUsageTracker.estimateTokens(text);

            llmUsageTracker.record({
                requestId,
                userId: options?.userId,
                model,
                provider: 'google_ai',
                inputTokens,
                outputTokens,
                purpose: options?.purpose || 'text_generation',
                durationMs,
                success: true,
            });

            return text;
        } catch (e: any) {
            const durationMs = Date.now() - startTime;

            // Handle timeout specifically
            if (e.name === 'AbortError') {
                logger.error('GoogleAIStudioAdapter: Request timed out', {
                    requestId,
                    model,
                    timeoutMs: DEFAULT_TIMEOUT_MS,
                });
                throw new Error(`Gemini API timeout after ${DEFAULT_TIMEOUT_MS}ms`);
            }

            // Track failed request
            llmUsageTracker.record({
                requestId,
                userId: options?.userId,
                model,
                provider: 'google_ai',
                inputTokens: llmUsageTracker.estimateTokens(prompt),
                outputTokens: 0,
                purpose: options?.purpose || 'text_generation',
                durationMs,
                success: false,
            });

            logger.error('GoogleAIStudioAdapter: API call failed', {
                requestId,
                error: e.message,
            });
            throw e;
        }
    }

    async generateText(
        prompt: string,
        options?: { model?: string; maxTokens?: number; temperature?: number }
    ): Promise<string> {
        if (!this.apiKey) {
            logger.warn('GoogleAIStudioAdapter: No API key, returning mock response');
            return 'Mock response - Set GOOGLE_AI_API_KEY for real Gemini responses';
        }
        return this.callGemini(prompt, { ...options, purpose: 'text_generation' });
    }

    async generateJson<T>(
        prompt: string,
        _schema?: any,
        options?: { model?: string; maxTokens?: number; temperature?: number }
    ): Promise<T> {
        if (!this.apiKey) {
            logger.warn('GoogleAIStudioAdapter: No API key, returning mock JSON');
            return {} as T;
        }

        try {
            // First try with JSON response mode
            const text = await this.callGemini(prompt, {
                ...options,
                responseType: 'json',
                purpose: 'json_generation',
            });
            return JsonParser.parse<T>(text);
        } catch (e) {
            logger.warn('GoogleAIStudioAdapter: JSON mode failed, trying text fallback', { error: e });
            // Fallback: Ask for JSON in prompt
            const text = await this.callGemini(
                `${prompt}\n\nRespond with valid JSON only. No markdown, no code blocks.`,
                { ...options, purpose: 'json_generation' }
            );

            try {
                return JsonParser.parse<T>(text);
            } catch (parseError) {
                logger.error('GoogleAIStudioAdapter: Failed to parse JSON', { text, error: parseError });
                throw new Error("Failed to parse JSON from LLM");
            }
        }
    }

    async analyzeImage(
        imageBase64: string,
        mimeType: string,
        prompt: string,
        options?: { model?: string }
    ): Promise<string> {
        if (!this.apiKey) {
            return 'Mock image analysis - Set GOOGLE_AI_API_KEY for real analysis';
        }

        const model = options?.model || 'gemini-1.5-flash';
        const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
        const requestId = crypto.randomUUID();
        const startTime = Date.now();

        const body = {
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType, data: imageBase64 } }
                ]
            }],
            generationConfig: {
                maxOutputTokens: 4096,
                temperature: 0.4,
            }
        };

        try {
            const response = await this.fetchWithTimeout(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            }, IMAGE_TIMEOUT_MS);

            if (!response.ok) {
                throw new Error(`Gemini Vision API error: ${response.status}`);
            }

            const data: GeminiResponse = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const durationMs = Date.now() - startTime;

            // Track usage
            llmUsageTracker.record({
                requestId,
                model,
                provider: 'google_ai',
                inputTokens: data.usageMetadata?.promptTokenCount || 1000,
                outputTokens: data.usageMetadata?.candidatesTokenCount ||
                    llmUsageTracker.estimateTokens(text),
                purpose: 'image_analysis',
                durationMs,
                success: true,
            });

            return text;
        } catch (e: any) {
            if (e.name === 'AbortError') {
                throw new Error(`Image analysis timeout after ${IMAGE_TIMEOUT_MS}ms`);
            }
            logger.error('GoogleAIStudioAdapter: Image analysis failed', {
                requestId,
                error: e.message,
            });
            throw e;
        }
    }
}
