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

    // 1. Analyze Image using the new "Proustian Trigger" logic
    // The aiService.analyzeImage now returns a 'conversationalTrigger' specifically for voice.
    const analysis = await this.aiService.analyzeImage(imageBase64, mimeType);

    // Add implicit user action to transcript (Context grounding)
    transcript.push({
        id: `msg-${Date.now()}`,
        speaker: 'user',
        text: `[User showed a photo]: ${analysis.description}`,
        timestamp: new Date().toISOString(),
        isSystemEvent: true
    });

    // 2. Determine the best response
    // If we have a direct conversational trigger from Vision, use it.
    // Otherwise, fall back to the text generation.
    let responseText = analysis.conversationalTrigger;
    let strategy = 'emotional_deepening';

    if (!responseText) {
        // Fallback: Use the standard generation loop
        const history = transcript.slice(-5);
        const memories = await this.vectorStore.retrieveContext(session.userId, analysis.description);

        const response = await this.aiService.generateQuestion(
            "[User showed a photo]",
            history,
            memories,
            analysis.description
        );
        responseText = response.text;
        strategy = response.strategy;
    }

    // 3. Generate Audio (ElevenLabs - The Presence)
    const audioBuffer = await this.aiService.generateSpeech(responseText, strategy);

    // 4. Update Transcript with Agent Response
    transcript.push({
        id: `msg-${Date.now() + 1}`,
        speaker: 'agent',
        text: responseText,
        timestamp: new Date().toISOString(),
        strategy: strategy
    });

    session.transcriptRaw = JSON.stringify(transcript);
    await this.sessionRepository.update(session);

    return {
        text: responseText,
        audioBase64: audioBuffer.toString('base64')
    };
  }
}
