import { StartSessionUseCase } from '../../lib/core/application/use-cases/StartSessionUseCase';
import { SessionRepository } from '../../lib/core/domain/repositories/SessionRepository';
import { AIServicePort } from '../../lib/core/application/ports/AIServicePort';
import { VectorStorePort } from '../../lib/core/application/ports/VectorStorePort';
import { Session } from '../../lib/core/domain/entities/Session';

// Mock Dependencies
const mockSessionRepository: SessionRepository = {
    create: async (session) => session,
    findById: async () => null,
    update: async () => {},
    findByUserId: async () => []
};

const mockAIService: AIServicePort = {
    startVoiceConversation: async () => ({ agentId: 'test', conversationId: 'test' }),
    generateQuestion: async () => ({ text: 'test', strategy: 'test' }),
    generateChapterAnalysis: async () => ({}),
    generateChapterNarrative: async () => ({ content: 'test', wordCount: 10 })
};

const mockVectorStore: VectorStorePort = {
    storeConversation: async () => {},
    retrieveContext: async () => []
};

// Simple manual test runner
(async () => {
    const useCase = new StartSessionUseCase(mockSessionRepository, mockAIService, mockVectorStore);
    const result = await useCase.execute('user-123');

    if (result.session.userId === 'user-123' && result.session.status === 'active') {
        console.log('StartSessionUseCase Test PASSED');
    } else {
        console.error('StartSessionUseCase Test FAILED');
        process.exit(1);
    }
})();
