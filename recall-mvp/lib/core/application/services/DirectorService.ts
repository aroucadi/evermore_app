import { LLMPort } from '../../ports/LLMPort';
import { VoiceAgentPort } from '../../ports/VoiceAgentPort';

export class DirectorService {
    private llm: LLMPort;
    private voiceAgent: VoiceAgentPort;

    constructor(llm: LLMPort, voiceAgent: VoiceAgentPort) {
        this.llm = llm;
        this.voiceAgent = voiceAgent;
    }

    async startSession(userId: string, sessionId: string, userName: string, memories: any[], imageContext?: string) {
        // 1. Determine Strategy/Goal using LLM (The Director)
        let goal = "Ask about their childhood.";
        try {
             const planPrompt = `
                You are the Director of a biography project. Subject: ${userName}.
                Memories: ${JSON.stringify(memories.slice(0, 5))}
                ${imageContext ? `TRIGGER: User uploaded a photo: ${imageContext}` : ''}

                Define the session goal.
                ${imageContext ? 'GOAL: Explore the story behind the photo.' : 'GOAL: Explore a specific memory in depth.'}
                Keep it under 30 words.
             `;
             goal = await this.llm.generateText(planPrompt, { maxTokens: 50 });
        } catch (e) {
            console.warn("Director failed to generate goal, using default.");
        }

        // 2. Start Voice Agent with this Goal
        return this.voiceAgent.startConversation(userId, sessionId, userName, {
            goal: goal.trim(),
            memories,
            imageContext
        });
    }
}
