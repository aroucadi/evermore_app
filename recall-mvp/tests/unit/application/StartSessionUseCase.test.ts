import { describe, it, expect, vi } from 'vitest';
import { StartSessionUseCase } from '@/lib/core/application/use-cases/StartSessionUseCase';
import { SessionRepository } from '@/lib/core/domain/repositories/SessionRepository';
import { UserRepository } from '@/lib/core/domain/repositories/UserRepository';
import { AIServicePort } from '@/lib/core/application/ports/AIServicePort';
import { VectorStorePort } from '@/lib/core/application/ports/VectorStorePort';
import { Session } from '@/lib/core/domain/entities/Session';

describe('StartSessionUseCase', () => {
  const mockSessionRepository: SessionRepository = {
    create: vi.fn(async (session) => session),
    findById: vi.fn(),
    update: vi.fn(),
    findByUserId: vi.fn()
  };

  const mockUserRepository: UserRepository = {
    findById: vi.fn(async () => ({ id: 'user-123', name: 'Test User' } as any)),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  };

  const mockAIService: AIServicePort = {
    startVoiceConversation: vi.fn(async () => ({ agentId: 'test-agent', conversationId: 'test-conv' })),
    generateQuestion: vi.fn(),
    generateChapterAnalysis: vi.fn(),
    generateChapterNarrative: vi.fn(),
    analyzeImage: vi.fn(),
    generateSpeech: vi.fn()
  };

  const mockVectorStore: VectorStorePort = {
    storeConversation: vi.fn(),
    retrieveContext: vi.fn(async () => [])
  };

  it('should successfully start a session', async () => {
    const useCase = new StartSessionUseCase(mockSessionRepository, mockUserRepository, mockAIService, mockVectorStore);
    const result = await useCase.execute('user-123');

    expect(result.session).toBeInstanceOf(Session);
    expect(result.session.userId).toBe('user-123');
    expect(result.session.status).toBe('active');
    expect(mockAIService.startVoiceConversation).toHaveBeenCalled();
    expect(mockSessionRepository.create).toHaveBeenCalled();
  });
});
