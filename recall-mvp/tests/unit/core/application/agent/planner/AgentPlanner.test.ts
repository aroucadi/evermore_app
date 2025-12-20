import { describe, it, expect, vi } from 'vitest';
import { AgentPlanner } from '../../../../../../lib/core/application/agent/AgentPlanner';
import { LLMPort } from '../../../../../../lib/core/application/ports/LLMPort';

describe('AgentPlanner', () => {
    it('should generate a plan', async () => {
        const mockLlm: LLMPort = {
            generateJson: vi.fn().mockResolvedValue({ goal: 'Goal', steps: ['Step 1'] }),
            generateText: vi.fn(),
            analyzeImage: vi.fn(),
        };

        const planner = new AgentPlanner(mockLlm);
        const plan = await planner.createPlan('Goal', { userId: '1', sessionId: '1', memories: [], recentHistory: [] });

        expect(mockLlm.generateJson).toHaveBeenCalled();
        expect(plan.steps).toHaveLength(1);
    });
});
