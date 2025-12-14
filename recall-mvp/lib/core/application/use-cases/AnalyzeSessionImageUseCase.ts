import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { AIServicePort } from '../ports/AIServicePort';
import { VectorStorePort } from '../ports/VectorStorePort';

export class AnalyzeSessionImageUseCase {
  constructor(
    private sessionRepository: SessionRepository,
    private aiService: AIServicePort,
    private vectorStore: VectorStorePort
  ) {}

  async execute(sessionId: string, imageBase64: string, mimeType: string): Promise<{ text: string; audioBase64: string }> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new Error('Session not found');

    const transcript = JSON.parse(session.transcriptRaw || '[]');

    // 1. Analyze Image
    const analysis = await this.aiService.analyzeImage(imageBase64, mimeType);

    // Add implicit user action to transcript
    transcript.push({
        id: `msg-${Date.now()}`,
        speaker: 'user',
        text: `[User showed a photo]: ${analysis.description}`,
        timestamp: new Date().toISOString(),
        isSystemEvent: true
    });

    // 2. Generate Question based on Image Context
    const history = transcript.slice(-5);
    // Retrieve memories relevant to the image description
    const memories = await this.vectorStore.retrieveContext(session.userId, analysis.description);

    const response = await this.aiService.generateQuestion(
        "I just showed you a photo.",
        history,
        memories,
        analysis.description // Inject image context
    );

    // 3. Generate Audio for the Question
    const audioBuffer = await this.aiService.generateSpeech(response.text, response.strategy);

    // 4. Update Transcript with Agent Response
    transcript.push({
        id: `msg-${Date.now() + 1}`,
        speaker: 'agent',
        text: response.text,
        timestamp: new Date().toISOString(),
        strategy: response.strategy
    });

    session.transcriptRaw = JSON.stringify(transcript);
    await this.sessionRepository.update(session);

    return {
        text: response.text,
        audioBase64: audioBuffer.toString('base64')
    };
  }
}
