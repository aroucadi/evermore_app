import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReActAgent } from '../../../../../lib/core/application/agent/ReActAgent';
import { LLMPort } from '../../../../../lib/core/application/ports/LLMPort';
import { Tool } from '../../../../../lib/core/application/agent/types';
import { AgentTracer } from '../../../../../lib/core/application/agent/AgentTracer';

describe('ReActAgent', () => {
    let mockLlm: LLMPort;
    let mockTool: Tool;
    let agent: ReActAgent;

    beforeEach(() => {
        mockLlm = {
            generateText: vi.fn(),
            generateJson: vi.fn(),
            analyzeImage: vi.fn(),
        };

        mockTool = {
            name: 'TestTool',
            description: 'A test tool',
            schema: { type: 'object' },
            execute: vi.fn().mockResolvedValue('Tool Output'),
        };

        agent = new ReActAgent(mockLlm, [mockTool], 'System Prompt');
    });

    it('should loop through Think -> Act -> Observe -> Final Answer', async () => {
        // Step 1: Think -> Act
        (mockLlm.generateJson as any)
            .mockResolvedValueOnce({
                thought: 'I need to use the tool',
                action: 'TestTool',
                actionInput: { key: 'value' },
            })
            // Step 2: Think -> Final Answer
            .mockResolvedValueOnce({
                thought: 'I have the info',
                action: 'Final Answer',
                actionInput: 'Result',
            });

        const context = {
            userId: 'user1',
            sessionId: 'session1',
            memories: [],
            recentHistory: [],
        };

        const tracer = new AgentTracer('session1');
        const result = await agent.run('Goal', context, tracer);

        expect(mockLlm.generateJson).toHaveBeenCalledTimes(2);
        expect(mockTool.execute).toHaveBeenCalledWith({ key: 'value' });
        expect(result.success).toBe(true);
        expect(result.finalAnswer).toBe('Result');
        expect(result.steps).toHaveLength(2);
        expect(result.steps[0].observation).toBe('Tool Output');
    });

    it('should handle tool errors gracefully', async () => {
        (mockTool.execute as any).mockRejectedValue(new Error('Tool Failed'));

        (mockLlm.generateJson as any)
            .mockResolvedValueOnce({
                thought: 'Using tool',
                action: 'TestTool',
                actionInput: {},
            })
            .mockResolvedValueOnce({
                thought: 'Tool failed, giving up',
                action: 'Final Answer',
                actionInput: 'Error handled',
            });

        const context = { userId: '1', sessionId: '1', memories: [], recentHistory: [] };
        const result = await agent.run('Goal', context);

        expect(result.steps[0].observation).toContain('Error: Tool Failed');
        expect(result.finalAnswer).toBe('Error handled');
    });
});
