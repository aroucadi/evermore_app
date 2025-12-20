import { DrizzleUserRepository } from '../adapters/db/DrizzleUserRepository';
import { DrizzleSessionRepository } from '../adapters/db/DrizzleSessionRepository';
import { DrizzleChapterRepository } from '../adapters/db/DrizzleChapterRepository';
import { DrizzleJobRepository } from '../adapters/db/DrizzleJobRepository';
import { DrizzleInvitationRepository } from '../adapters/db/DrizzleInvitationRepository';

// New Adapters
import { GoogleVertexAdapter } from '../adapters/ai/GoogleVertexAdapter';
import { ElevenLabsAdapter } from '../adapters/speech/ElevenLabsAdapter';
import { HuggingFaceAdapter } from '../adapters/speech/HuggingFaceAdapter';
import { ManualVoiceAgentAdapter } from '../adapters/speech/ManualVoiceAgentAdapter';
import { AoTChapterGeneratorAdapter } from '../adapters/ai/AoTChapterGeneratorAdapter';
import { PineconeStore } from '../adapters/vector/PineconeStore';
import { ResendEmailService } from '../adapters/email/ResendEmailService';
import { PDFService } from '../adapters/biographer/PDFService';

// Domain Services / Application Services
import { ContentSafetyGuard } from '../../core/application/services/ContentSafetyGuard';
import { SessionGoalArchitect } from '../../core/application/services/SessionGoalArchitect';
import { UserProfileUpdater } from '../../core/application/services/UserProfileUpdater';
import { InvitationScheduler } from '../../core/application/services/InvitationScheduler';

// Mocks
import { MockAIService } from '../adapters/mocks/MockAIService';
import { MockVectorStore } from '../adapters/mocks/MockVectorStore';
import { MockEmailService } from '../adapters/mocks/MockEmailService';
import { MockChapterGeneratorAdapter } from '../adapters/mocks/MockChapterGeneratorAdapter';

// Use Cases
import { CreateUserUseCase } from '../../core/application/use-cases/CreateUserUseCase';
import { StartSessionUseCase } from '../../core/application/use-cases/StartSessionUseCase';
import { ProcessMessageUseCase } from '../../core/application/use-cases/ProcessMessageUseCase';
import { EndSessionUseCase } from '../../core/application/use-cases/EndSessionUseCase';
import { GenerateChapterUseCase } from '../../core/application/use-cases/GenerateChapterUseCase';
import { GetChaptersUseCase } from '../../core/application/use-cases/GetChaptersUseCase';
import { AnalyzeSessionImageUseCase } from '../../core/application/use-cases/AnalyzeSessionImageUseCase';
import { ExportBookUseCase } from '../../core/application/use-cases/ExportBookUseCase';
import { AIServicePort } from '../../core/application/ports/AIServicePort';

const useMocks = process.env.USE_MOCKS === 'true';

// Singletons
export const userRepository = new DrizzleUserRepository();
export const sessionRepository = new DrizzleSessionRepository();
export const chapterRepository = new DrizzleChapterRepository();
export const jobRepository = new DrizzleJobRepository();
const invitationRepository = new DrizzleInvitationRepository();

// --- ADAPTERS CONFIGURATION ---
const isHuggingFace = process.env.SPEECH_PROVIDER === 'huggingface';

// Always instantiate HuggingFaceAdapter as a potential fallback or primary
const hfAdapter = new HuggingFaceAdapter();

export const speechProvider = isHuggingFace
    ? hfAdapter
    : new ElevenLabsAdapter(hfAdapter); // Inject fallback STT provider

export const llmProvider = new GoogleVertexAdapter();

// Services wired with strict DI
export const vectorStore = useMocks ? new MockVectorStore() : new PineconeStore(sessionRepository);
export const emailService = useMocks ? new MockEmailService() : new ResendEmailService();

// AoT needs LLM
export const chapterGenerator = useMocks
    ? new MockChapterGeneratorAdapter()
    : new AoTChapterGeneratorAdapter(llmProvider);

export const contentSafetyGuard = new ContentSafetyGuard(llmProvider, emailService, sessionRepository);
export const pdfService = new PDFService();
export const userProfileUpdater = new UserProfileUpdater(userRepository);

const voiceAgentProvider = isHuggingFace
    ? new ManualVoiceAgentAdapter()
    : (speechProvider as ElevenLabsAdapter);

export const sessionGoalArchitect = new SessionGoalArchitect(llmProvider, voiceAgentProvider);
export const invitationScheduler = new InvitationScheduler(userRepository, invitationRepository);

// --- LEGACY/BRIDGE SUPPORT ---
class AIServiceBridge implements AIServicePort {
    constructor(
        private llm: GoogleVertexAdapter,
        private speech: any, // SpeechPort
        private director: SessionGoalArchitect
    ) {}

    async generateQuestion(userUtterance: string, history: any[], memories: any[], imageContext?: string): Promise<{ text: string; strategy: string }> {
         const prompt = `
            Context: ${JSON.stringify(history)}
            Memories: ${JSON.stringify(memories)}
            Image: ${imageContext || 'None'}
            User: ${userUtterance}
            Generate follow up question JSON: { "text": "...", "strategy": "..." }
         `;
         try {
            return await this.llm.generateJson(prompt);
         } catch {
             return { text: "Tell me more.", strategy: "fallback" };
         }
    }

    async generateChapterAnalysis(transcript: string): Promise<any> {
        return this.llm.generateJson(`Analyze transcript: ${transcript}`, {});
    }

    async generateChapterNarrative(transcript: string, analysis: any): Promise<{ content: string; wordCount: number }> {
        const content = await this.llm.generateText(`Write chapter based on analysis ${JSON.stringify(analysis)} and transcript ${transcript}`);
        return { content, wordCount: content.split(' ').length };
    }

    async startVoiceConversation(userId: string, sessionId: string, userName: string, memories: any[], imageContext?: string): Promise<{ agentId: string; conversationId: string; wsUrl?: string }> {
         throw new Error("Deprecated: Use SessionGoalArchitect directly.");
    }

    async analyzeImage(imageBase64: string, mimeType: string): Promise<{ description: string; detectedEntities: string[]; conversationalTrigger?: string }> {
        const text = await this.llm.analyzeImage(imageBase64, mimeType, "Analyze image. Output JSON: {description, entities, conversationalTrigger}");
        try {
            const clean = text.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(clean);
        } catch {
            return { description: text, detectedEntities: [] };
        }
    }

    async generateSpeech(text: string, style?: string): Promise<Buffer> {
        return this.speech.textToSpeech(text, style);
    }
}

export const aiService = useMocks
    ? new MockAIService()
    : new AIServiceBridge(llmProvider, speechProvider, sessionGoalArchitect);


// Use Cases

export const createUserUseCase = new CreateUserUseCase(userRepository);

export const startSessionUseCase = new StartSessionUseCase(
    sessionRepository,
    userRepository,
    sessionGoalArchitect,
    vectorStore
);

export const processMessageUseCase = new ProcessMessageUseCase(
    sessionRepository,
    userRepository, // Added UserRepository injection
    llmProvider,
    vectorStore,
    contentSafetyGuard
);

export const generateChapterUseCase = new GenerateChapterUseCase(
    chapterRepository,
    sessionRepository,
    userRepository,
    chapterGenerator,
    emailService,
    llmProvider
);

export const analyzeSessionImageUseCase = new AnalyzeSessionImageUseCase(
    sessionRepository,
    llmProvider,
    speechProvider,
    vectorStore
);

export const exportBookUseCase = new ExportBookUseCase(chapterRepository, pdfService);

export const endSessionUseCase = new EndSessionUseCase(sessionRepository, jobRepository);
export const getChaptersUseCase = new GetChaptersUseCase(chapterRepository);
