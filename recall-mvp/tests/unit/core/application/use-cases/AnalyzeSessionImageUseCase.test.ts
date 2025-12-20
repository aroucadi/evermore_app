import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyzeSessionImageUseCase } from '@/lib/core/application/use-cases/AnalyzeSessionImageUseCase';
import { SessionRepository } from '@/lib/core/domain/repositories/SessionRepository';
import { LLMPort } from '@/lib/core/application/ports/LLMPort';
import { SpeechPort } from '@/lib/core/application/ports/SpeechPort';
import { VectorStorePort } from '@/lib/core/application/ports/VectorStorePort';

describe('AnalyzeSessionImageUseCase', () => {
    let useCase: AnalyzeSessionImageUseCase;
    let mockSessionRepo: SessionRepository;
    let mockLlm: LLMPort;
    let mockSpeech: SpeechPort;
    let mockVectorStore: VectorStorePort;

    beforeEach(() => {
        mockSessionRepo = {
            findById: vi.fn().mockResolvedValue({
                id: 'session1',
                userId: 'user1',
                transcriptRaw: '[]',
                update: vi.fn()
            }),
            update: vi.fn(),
        } as any;

        mockLlm = {
            analyzeImage: vi.fn().mockResolvedValue('{"description": "A photo of a dog", "detectedEntities": ["dog"], "conversationalTrigger": "Tell me about the dog."}'),
            generateJson: vi.fn(),
        } as any;

        mockSpeech = {
            textToSpeech: vi.fn().mockResolvedValue(Buffer.from('audio')),
        } as any;

        mockVectorStore = {
            retrieveContext: vi.fn(),
        } as any;

        useCase = new AnalyzeSessionImageUseCase(mockSessionRepo, mockLlm, mockSpeech, mockVectorStore);
    });

    it('should analyze image and generate audio response', async () => {
        const result = await useCase.execute('session1', 'base64image', 'image/jpeg');

        expect(mockLlm.analyzeImage).toHaveBeenCalledWith('base64image', 'image/jpeg', expect.stringContaining("Analyze this image"));
        expect(mockSpeech.textToSpeech).toHaveBeenCalledWith("Tell me about the dog.", "emotional_deepening");
        expect(result.text).toBe("Tell me about the dog.");
        expect(result.audioBase64).toBe(Buffer.from('audio').toString('base64'));
    });

    it('should handle fallback generation if no trigger provided', async () => {
        (mockLlm.analyzeImage as any).mockResolvedValue('{"description": "A photo", "detectedEntities": []}');
        (mockLlm.generateJson as any).mockResolvedValue({ text: "Generated Question", strategy: "fallback" });

        const result = await useCase.execute('session1', 'base64image', 'image/jpeg');

        expect(mockLlm.generateJson).toHaveBeenCalled();
        expect(result.text).toBe("Generated Question");
    });
});
