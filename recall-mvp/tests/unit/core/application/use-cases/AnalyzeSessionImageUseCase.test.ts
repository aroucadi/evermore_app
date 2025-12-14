import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyzeSessionImageUseCase } from '@/lib/core/application/use-cases/AnalyzeSessionImageUseCase';
import { SessionRepository } from '@/lib/core/domain/repositories/SessionRepository';
import { AIServicePort } from '@/lib/core/application/ports/AIServicePort';
import { VectorStorePort } from '@/lib/core/application/ports/VectorStorePort';

describe('AnalyzeSessionImageUseCase', () => {
  let useCase: AnalyzeSessionImageUseCase;
  let sessionRepo: SessionRepository;
  let aiService: AIServicePort;
  let vectorStore: VectorStorePort;

  beforeEach(() => {
    sessionRepo = {
        create: vi.fn(),
        findById: vi.fn().mockResolvedValue({
            id: 'session-1',
            userId: 'user-1',
            transcriptRaw: '[]',
            status: 'active',
            startedAt: new Date()
        }),
        update: vi.fn(),
        findByUserId: vi.fn(),
        findLastSessions: vi.fn(),
        completeSessionTransaction: vi.fn()
    } as any;

    aiService = {
        analyzeImage: vi.fn().mockResolvedValue({
            description: "A photo of a dog.",
            detectedEntities: ["dog"]
        }),
        generateQuestion: vi.fn().mockResolvedValue({
            text: "Tell me about the dog.",
            strategy: "visual_inquiry"
        }),
        generateSpeech: vi.fn().mockResolvedValue(Buffer.from("audio")),
        generateChapterAnalysis: vi.fn(),
        generateChapterNarrative: vi.fn(),
        startVoiceConversation: vi.fn()
    } as any;

    vectorStore = {
        retrieveContext: vi.fn().mockResolvedValue([]),
        storeConversation: vi.fn(),
        storeMemoryChunk: vi.fn()
    } as any;

    useCase = new AnalyzeSessionImageUseCase(sessionRepo, aiService, vectorStore);
  });

  it('should analyze image, generate question and audio, and update transcript', async () => {
    const result = await useCase.execute('session-1', 'base64img', 'image/jpeg');

    expect(aiService.analyzeImage).toHaveBeenCalledWith('base64img', 'image/jpeg');
    expect(aiService.generateQuestion).toHaveBeenCalled();
    expect(aiService.generateSpeech).toHaveBeenCalledWith("Tell me about the dog.", "visual_inquiry");

    expect(sessionRepo.update).toHaveBeenCalled();
    const updatedSession = (sessionRepo.update as any).mock.calls[0][0];
    const transcript = JSON.parse(updatedSession.transcriptRaw);

    expect(transcript).toHaveLength(2); // User implicit action + Agent response
    expect(transcript[0].text).toContain("A photo of a dog");
    expect(transcript[1].text).toBe("Tell me about the dog.");

    expect(result.text).toBe("Tell me about the dog.");
    expect(result.audioBase64).toBe(Buffer.from("audio").toString('base64'));
  });
});
