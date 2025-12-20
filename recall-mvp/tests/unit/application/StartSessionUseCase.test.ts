import { describe, it, expect, vi } from 'vitest';
import { StartSessionUseCase } from '@/lib/core/application/use-cases/StartSessionUseCase';
import { SessionRepository } from '@/lib/core/domain/repositories/SessionRepository';
import { UserRepository } from '@/lib/core/domain/repositories/UserRepository';
import { SessionGoalArchitect } from '@/lib/core/application/services/SessionGoalArchitect';
import { VectorStorePort } from '@/lib/core/application/ports/VectorStorePort';
import { Session } from '@/lib/core/domain/entities/Session';

describe('StartSessionUseCase', () => {
  const mockSessionRepository: SessionRepository = {
    create: vi.fn(async (session) => session),
    findById: vi.fn(),
    update: vi.fn(),
    findByUserId: vi.fn(),
    findLastSessions: vi.fn(),
    completeSessionTransaction: vi.fn()
  } as any;

  const mockUserRepository: UserRepository = {
    findById: vi.fn(async () => ({
        id: 'user-123',
        name: 'Test User',
        preferences: { topicsAvoid: [], topicsLove: [] }
    } as any)),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  };

  const mockSessionGoalArchitect: SessionGoalArchitect = {
    determineSessionGoal: vi.fn(async () => ({ agentId: 'test-agent', conversationId: 'test-conv' }))
  } as any;

  const mockVectorStore: VectorStorePort = {
    storeConversation: vi.fn(),
    retrieveContext: vi.fn(async () => []),
    storeMemoryChunk: vi.fn()
  } as any;

  it('should successfully start a session', async () => {
    // Correctly injecting mockSessionGoalArchitect instead of mockDirectorService
    const useCase = new StartSessionUseCase(
        mockSessionRepository,
        mockUserRepository,
        mockSessionGoalArchitect,
        mockVectorStore
    );
    const result = await useCase.execute('user-123');

    expect(result.session).toBeInstanceOf(Session);
    expect(result.session.userId).toBe('user-123');
    expect(result.session.status).toBe('active');
    expect(mockSessionGoalArchitect.determineSessionGoal).toHaveBeenCalledWith(
        expect.objectContaining({
            userId: 'user-123',
            userName: 'Test User'
        })
    );
    expect(mockSessionRepository.create).toHaveBeenCalled();
  });
});
