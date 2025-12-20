import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DirectorService } from '../../../../../lib/core/application/services/DirectorService';
import { LLMPort } from '../../../../../lib/core/application/ports/LLMPort';
import { VoiceAgentPort } from '../../../../../lib/core/application/ports/VoiceAgentPort';
import { UserRepository } from '../../../../../lib/core/domain/repositories/UserRepository';

describe('DirectorService (Chain of Thought)', () => {
    let director: DirectorService;
    let mockLLM: LLMPort;
    let mockVoiceAgent: VoiceAgentPort;
    let mockUserRepo: UserRepository;

    beforeEach(() => {
        mockLLM = {
            generateText: vi.fn(),
            generateJson: vi.fn(),
            analyzeImage: vi.fn()
        };
        mockVoiceAgent = {
            startConversation: vi.fn()
        };
        mockUserRepo = {
            findById: vi.fn().mockResolvedValue({
                id: '1',
                preferences: { topicsAvoid: ['politics'], topicsLove: ['music'] }
            })
        } as any;

        director = new DirectorService(mockLLM, mockVoiceAgent, mockUserRepo);
    });

    it('should use Chain of Thought to determine goal', async () => {
        vi.spyOn(mockLLM, 'generateJson').mockResolvedValue({
            contextSummary: "User loves music.",
            safetyRisks: [],
            potentialStrategies: ["Ask about favorite band", "Ask about first concert"],
            selectedStrategy: "Ask about first concert",
            finalGoal: "Ask about their first concert experience."
        });

        await director.startSession('u1', 's1', 'John', []);

        expect(mockLLM.generateJson).toHaveBeenCalled();
        const callArgs = (mockLLM.generateJson as any).mock.calls[0][0];
        expect(callArgs).toContain('Chain of Thought');
        expect(callArgs).toContain('Topics to Avoid: politics');

        expect(mockVoiceAgent.startConversation).toHaveBeenCalledWith(
            'u1', 's1', 'John',
            expect.objectContaining({ goal: "Ask about their first concert experience." })
        );
    });

    it('should fallback to basic prompt if CoT fails', async () => {
        vi.spyOn(mockLLM, 'generateJson').mockRejectedValue(new Error("CoT Failed"));
        vi.spyOn(mockLLM, 'generateText').mockResolvedValue("Fallback Goal");

        await director.startSession('u1', 's1', 'John', []);

        expect(mockLLM.generateText).toHaveBeenCalled();
        expect(mockVoiceAgent.startConversation).toHaveBeenCalledWith(
            'u1', 's1', 'John',
            expect.objectContaining({ goal: "Fallback Goal" })
        );
    });
});
