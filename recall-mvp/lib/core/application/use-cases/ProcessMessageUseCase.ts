import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { LLMPort } from '../ports/LLMPort';
import { VectorStorePort } from '../ports/VectorStorePort';
import { ContentSafetyGuard } from '../services/ContentSafetyGuard';
import { EnhancedReActAgent } from '../agent/EnhancedReActAgent';
import { CONVERSATIONAL_AGENT_SYSTEM_PROMPT } from '../agent/prompts/SystemPrompts';
import { RetrieveMemoriesTool } from '../agent/tools/RetrieveMemoriesTool';
import { CheckSafetyTool } from '../agent/tools/CheckSafetyTool';
import { ToolRegistry, ToolCapability, ToolPermission } from '../agent/tools/ToolContracts';
import { ModelRouter, ModelTier, TaskComplexity, ModelProfile } from '../agent/routing/ModelRouter';
import { HallucinationDetector, GroundTruthSource } from '../safety/HallucinationDetector';
import { z } from 'zod';

export class ProcessMessageUseCase {
  private hallucinationDetector: HallucinationDetector;

  constructor(
    private sessionRepository: SessionRepository,
    private userRepository: UserRepository,
    private llm: LLMPort,
    private vectorStore: VectorStorePort,
    private contentSafetyGuard: ContentSafetyGuard
  ) {
    // Initialize HallucinationDetector for response validation
    this.hallucinationDetector = new HallucinationDetector(llm, {
      flagThreshold: 0.7,
      maxSourcesToCheck: 5,
      suggestCorrections: true,
      defaultCheckTypes: ['FACT_GROUNDING', 'ENTITY_EXISTENCE'],
    });
  }

  async execute(
    sessionId: string,
    message: string,
    speaker: 'user' | 'agent'
  ): Promise<any> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new Error('Session not found');

    const transcript = JSON.parse(session.transcriptRaw || '[]');
    transcript.push({
      id: `msg-${Date.now()}`,
      speaker,
      text: message,
      timestamp: new Date().toISOString(),
    });

    // Save user message first
    session.transcriptRaw = JSON.stringify(transcript);
    await this.sessionRepository.update(session);

    if (speaker === 'user') {
      const user = await this.userRepository.findById(session.userId);
      const emergencyContact = user?.preferences?.emergencyContact?.email;

      // Fast check
      const isRisky = await this.contentSafetyGuard.monitor(
        message, session.userId, sessionId, emergencyContact
      );
      if (isRisky) {
        return { text: "I'm concerned about what you just said. I've notified someone who can help.", strategy: "safety_intervention" };
      }

      // 1. Initialize Tool Registry with proper contracts
      const toolRegistry = new ToolRegistry();

      const memoriesTool = new RetrieveMemoriesTool(this.vectorStore, session.userId);
      const safetyTool = new CheckSafetyTool(this.contentSafetyGuard, session.userId, sessionId, emergencyContact);

      // Register tools as proper ToolContracts to eliminate legacy fallback risk
      toolRegistry.register({
        metadata: {
          id: 'RetrieveMemories',
          name: 'Retrieve Memories',
          description: 'Search for past memories or conversations based on a query.',
          usageHint: 'Use when user asks about past events or memories.',
          version: '1.0.0',
          capabilities: [ToolCapability.READ],
          defaultPermission: ToolPermission.ALLOWED,
          estimatedCostCents: 0.01,
          estimatedLatencyMs: 500,
          enabled: true,
        },
        inputSchema: z.object({ query: z.string() }),
        outputSchema: z.string(),
        execute: async (input: { query: string }) => {
          const startTime = Date.now();
          try {
            const result = await memoriesTool.execute(input);
            return { success: true, data: result, durationMs: Date.now() - startTime };
          } catch (e: any) {
            return { success: false, error: { code: 'TOOL_ERROR', message: e.message, retryable: false }, durationMs: Date.now() - startTime };
          }
        }
      });

      toolRegistry.register({
        metadata: {
          id: 'CheckSafety',
          name: 'Check Safety',
          description: 'Check if the user input or intended response is safe.',
          usageHint: 'Use when checking content for safety concerns.',
          version: '1.0.0',
          capabilities: [ToolCapability.PURE],
          defaultPermission: ToolPermission.ALLOWED,
          estimatedCostCents: 0.05,
          estimatedLatencyMs: 1000,
          enabled: true,
        },
        inputSchema: z.object({ text: z.string() }),
        outputSchema: z.string(),
        execute: async (input: { text: string }) => {
          const startTime = Date.now();
          try {
            const result = await safetyTool.execute(input);
            return { success: true, data: result, durationMs: Date.now() - startTime };
          } catch (e: any) {
            return { success: false, error: { code: 'TOOL_ERROR', message: e.message, retryable: false }, durationMs: Date.now() - startTime };
          }
        }
      });

      // 2. Initialize Model Router (Minimal Config for reliability)
      const modelRouter = new ModelRouter([
        {
          id: 'gemini-flash',
          name: 'Gemini Flash',
          provider: 'google',
          tier: ModelTier.FLASH,
          costPer1KInputTokens: 0.005,
          costPer1KOutputTokens: 0.015,
          maxContextTokens: 32000,
          maxOutputTokens: 8192,
          latencyP50Ms: 500,
          latencyP95Ms: 1500,
          capabilities: [TaskComplexity.CLASSIFICATION, TaskComplexity.EXTRACTION, TaskComplexity.SUMMARIZATION],
          qualityScores: {},
          available: true
        },
        {
          id: 'gemini-pro',
          name: 'Gemini Pro',
          provider: 'google',
          tier: ModelTier.STANDARD,
          costPer1KInputTokens: 0.05,
          costPer1KOutputTokens: 0.15,
          maxContextTokens: 32000,
          maxOutputTokens: 8192,
          latencyP50Ms: 1000,
          latencyP95Ms: 3000,
          capabilities: [TaskComplexity.REASONING, TaskComplexity.CREATIVE, TaskComplexity.CODE],
          qualityScores: { [TaskComplexity.REASONING]: 0.9 },
          available: true
        }
      ]);

      const context = {
        userId: session.userId,
        sessionId: sessionId,
        memories: [],
        recentHistory: transcript.slice(-10)
      };

      // 3. Instantiate Enhanced Agent with registered tools
      const agent = new EnhancedReActAgent(
        this.llm,
        modelRouter,
        [memoriesTool, safetyTool], // Tools array for descriptions
        {
          userId: session.userId,
          modelProfile: ModelProfile.BALANCED,
          maxSteps: 5,
          costBudgetCents: 50
        },
        this.vectorStore,
        undefined,
        undefined,
        toolRegistry // Now properly populated with registered tools
      );

      const result = await agent.run(`User said: "${message}". Respond appropriately.`, context);

      let responseText = result.success ? result.finalAnswer : "I'm listening. Please go on.";

      // 4. HALLUCINATION DETECTION: Validate response against conversation context
      let hallucinationWarning: string | undefined;
      try {
        // Build ground truth from recent conversation
        const groundTruth: GroundTruthSource[] = transcript.slice(-5).map((msg: any, idx: number) => ({
          id: `msg-${idx}`,
          type: 'transcript' as const,
          content: `${msg.speaker}: ${msg.text}`,
          confidence: 1.0,
          timestamp: msg.timestamp,
        }));

        // Only check if we have context and a substantial response
        if (groundTruth.length > 0 && responseText.length > 50) {
          const hallucinationResult = await this.hallucinationDetector.check({
            text: responseText,
            groundTruth,
            checkType: 'FACT_GROUNDING',
            context: `This is a conversational response to: "${message}"`,
          });

          if (hallucinationResult.isLikelyHallucination && hallucinationResult.confidence > 0.7) {
            console.warn('[ProcessMessageUseCase] Hallucination detected:', hallucinationResult.summary);
            hallucinationWarning = hallucinationResult.summary;

            // If corrections are suggested, use the first one
            if (hallucinationResult.suggestedCorrections && hallucinationResult.suggestedCorrections.length > 0) {
              // Don't replace the response, but note it for transparency
              console.log('[ProcessMessageUseCase] Suggested correction available');
            }

            // Append a soft disclaimer for high-confidence hallucinations
            if (hallucinationResult.confidence > 0.85) {
              responseText += "\n\n_(I want to be transparent: I may have made some assumptions. Please let me know if anything doesn't sound right.)_";
            }
          }
        }
      } catch (hallucinationError) {
        // Don't fail the response if hallucination check fails
        console.warn('[ProcessMessageUseCase] Hallucination check failed:', hallucinationError);
      }

      transcript.push({
        id: `msg-${Date.now() + 1}`,
        speaker: 'agent',
        text: responseText,
        timestamp: new Date().toISOString(),
        strategy: 'agentic',
        metadata: {
          traceId: sessionId,
          reasoning: result.steps.map(s => s.thought).join(' -> '),
          cost: result.totalCostCents,
          hallucinationWarning, // Track if hallucination was detected
        }
      });

      session.transcriptRaw = JSON.stringify(transcript);
      await this.sessionRepository.update(session);

      return { text: responseText, strategy: 'agentic', hallucinationWarning };
    }

    return null;
  }
}
