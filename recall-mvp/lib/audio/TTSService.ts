/**
 * Text-to-Speech (TTS) Service Interface
 * 
 * Defines the contract for TTS providers (ElevenLabs, Google, Web Speech API)
 */

export interface TTSVoice {
    id: string;
    name: string;
    gender?: 'male' | 'female' | 'neutral';
    language: string;
    previewUrl?: string;
}

export interface TTSOptions {
    voiceId?: string;
    speed?: number; // 0.5 - 2.0
    pitch?: number; // 0.5 - 2.0
    emotion?: 'neutral' | 'warm' | 'excited' | 'calm';
    stability?: number; // 0-1 (ElevenLabs specific)
    clarity?: number; // 0-1 (ElevenLabs specific)
}

export interface TTSResult {
    audioData: ArrayBuffer;
    mimeType: string;
    duration: number; // seconds
    provider: string;
}

export interface TTSService {
    /**
     * Generate audio from text
     */
    synthesize(text: string, options?: TTSOptions): Promise<TTSResult>;

    /**
     * Get available voices
     */
    getVoices(): Promise<TTSVoice[]>;

    /**
     * Check if service is available
     */
    isAvailable(): Promise<boolean>;

    /**
     * Provider name for logging
     */
    readonly providerName: string;
}

/**
 * Server-side TTS Service - fallback for Node.js environments
 * Returns a no-op implementation that gracefully degrades
 */
class ServerTTSService implements TTSService {
    readonly providerName = 'Server Fallback (No Audio)';

    async isAvailable(): Promise<boolean> {
        return true; // Always "available" but returns empty audio
    }

    async getVoices(): Promise<TTSVoice[]> {
        return [{
            id: 'server-default',
            name: 'Text Only (Server)',
            language: 'en-US',
            gender: 'neutral'
        }];
    }

    async synthesize(text: string, options?: TTSOptions): Promise<TTSResult> {
        // Estimate duration based on text length
        const wordCount = text.split(/\s+/).length;
        const wordsPerSecond = (options?.speed || 1) * 2.5;
        const estimatedDuration = wordCount / wordsPerSecond;

        return {
            audioData: new ArrayBuffer(0),
            mimeType: 'audio/wav',
            duration: estimatedDuration,
            provider: this.providerName,
        };
    }
}

/**
 * TTS Service Factory - Returns best available provider
 * 
 * Priority order:
 * 1. ElevenLabs (if API key configured) - Not yet implemented
 * 2. Google Cloud TTS (if API key configured) - Not yet implemented
 * 3. Browser Web Speech API (client-side fallback)
 * 4. Server fallback (graceful degradation for SSR)
 */
export function createTTSService(): TTSService {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        // Dynamic import would be ideal, but for simplicity we use require pattern
        // In production, this would be properly code-split
        const { WebSpeechTTS } = require('./WebSpeechTTS');
        return new WebSpeechTTS();
    }

    // Server-side or no browser speech available - use fallback
    return new ServerTTSService();
}

/**
 * Async factory that checks availability before returning
 */
export async function createTTSServiceAsync(): Promise<TTSService> {
    const service = createTTSService();
    const available = await service.isAvailable();

    if (!available) {
        console.warn('[TTS] Primary service unavailable, using server fallback');
        return new ServerTTSService();
    }

    return service;
}

