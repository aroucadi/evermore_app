import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyzeSessionImageUseCase } from '@/lib/core/application/use-cases/AnalyzeSessionImageUseCase';
import { SessionRepository } from '@/lib/core/domain/repositories/SessionRepository';
import { LLMPort } from '@/lib/core/application/ports/LLMPort';
import { SpeechPort } from '@/lib/core/application/ports/SpeechPort';
import { VectorStorePort } from '@/lib/core/application/ports/VectorStorePort';

describe('AnalyzeSessionImageUseCase', () => {
  let useCase: AnalyzeSessionImageUseCase;
  let sessionRepo: SessionRepository;
  let llm: LLMPort;
  let speech: SpeechPort;
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

    llm = {
        analyzeImage: vi.fn().mockResolvedValue("A photo of a dog."),
        generateJson: vi.fn().mockResolvedValue({
            text: "Tell me about the dog.",
            strategy: "visual_inquiry"
        }),
        generateText: vi.fn()
    };

    speech = {
        textToSpeech: vi.fn().mockResolvedValue(Buffer.from("audio")),
        speechToText: vi.fn()
    };

    vectorStore = {
        retrieveContext: vi.fn().mockResolvedValue([]),
        storeConversation: vi.fn(),
        storeMemoryChunk: vi.fn()
    } as any;

    useCase = new AnalyzeSessionImageUseCase(sessionRepo, llm, speech, vectorStore);
  });

  it('should analyze image, generate question and audio, and update transcript', async () => {
    const result = await useCase.execute('session-1', 'base64img', 'image/jpeg');

    expect(llm.analyzeImage).toHaveBeenCalledWith('base64img', 'image/jpeg', expect.any(String));
    // expect(llm.generateJson).toHaveBeenCalled(); // This might not be called if analyzeImage returns conversationalTrigger (simulated by mocking analyzeImage response behavior if we wanted to test that path, but here we test the fallback path or we mock the prompt response).

    // In this test, analyzeImage returns simple string "A photo of a dog.", so the logic falls back to step 2 (generateJson)
    expect(llm.generateJson).toHaveBeenCalled();
    expect(speech.textToSpeech).toHaveBeenCalledWith("Tell me about the dog.", "visual_inquiry");

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
