import { LLMPort } from '../../ports/LLMPort';
import { VoiceAgentPort } from '../../ports/VoiceAgentPort';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class DirectorService {
    private llm: LLMPort;
    private voiceAgent: VoiceAgentPort;
    private userRepository: UserRepository | null = null; // Optional dependency for now to avoid breaking existing constructor if not injected

    constructor(llm: LLMPort, voiceAgent: VoiceAgentPort, userRepository?: UserRepository) {
        this.llm = llm;
        this.voiceAgent = voiceAgent;
        if (userRepository) {
            this.userRepository = userRepository;
        }
    }

    async startSession(userId: string, sessionId: string, userName: string, memories: any[], imageContext?: string) {
        // 1. Fetch User Preferences (F-01)
        let topicsAvoid = [];
        if (this.userRepository) {
            const user = await this.userRepository.findById(userId);
            if (user && user.preferences) {
                try {
                   // Ensure preferences is parsed if it's a string, or used directly if it's an object
                   const prefs = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;
                   if (prefs.topicsAvoid) {
                       topicsAvoid = prefs.topicsAvoid;
                   }
                } catch (e) {
                    console.warn("Failed to parse user preferences");
                }
            }
        }

        // 2. Determine Strategy/Goal using LLM (The Director)
        let goal = "Ask about their childhood.";
        try {
             const planPrompt = `
                You are the Director of a biography project. Subject: ${userName}.
                Memories: ${JSON.stringify(memories.slice(0, 5))}
                ${topicsAvoid.length > 0 ? `CRITICAL CONSTRAINT - AVOID TOPICS: ${topicsAvoid.join(', ')}` : ''}
                ${imageContext ? `TRIGGER: User uploaded a photo: ${imageContext}` : ''}

                Define the session goal.
                ${imageContext ? 'GOAL: Explore the story behind the photo.' : 'GOAL: Explore a specific memory in depth.'}
                Keep it under 30 words.
             `;
             goal = await this.llm.generateText(planPrompt, { maxTokens: 50 });
        } catch (e) {
            console.warn("Director failed to generate goal, using default.");
        }

        // 3. Start Voice Agent with this Goal
        return this.voiceAgent.startConversation(userId, sessionId, userName, {
            goal: goal.trim(),
            memories,
            imageContext
        });
    }
}
