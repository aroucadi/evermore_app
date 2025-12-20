import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { LLMPort } from '../ports/LLMPort';
import { SpeechPort } from '../ports/SpeechPort';
import { VectorStorePort } from '../ports/VectorStorePort';

export class AnalyzeSessionImageUseCase {
  constructor(
    private sessionRepository: SessionRepository,
    private llm: LLMPort,
    private speech: SpeechPort,
    private vectorStore: VectorStorePort
  ) {}

  async execute(sessionId: string, imageBase64: string, mimeType: string): Promise<{ text: string; audioBase64: string }> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new Error('Session not found');

    const transcript = JSON.parse(session.transcriptRaw || '[]');

    // 1. Analyze Image using LLM directly (Proustian Trigger)
    // We expect the LLM adapter to handle the prompt construction for image analysis
    // Or we provide the prompt here.
    const prompt = "Analyze this image for a biography session. Output JSON: {description: string, detectedEntities: string[], conversationalTrigger?: string}";
    const analysisRaw = await this.llm.analyzeImage(imageBase64, mimeType, prompt);

    let analysis: { description: string; detectedEntities: string[]; conversationalTrigger?: string };
    try {
        const clean = analysisRaw.replace(/```json\n?|\n?```/g, '').trim();
        analysis = JSON.parse(clean);
    } catch {
        analysis = { description: analysisRaw, detectedEntities: [] };
    }

    // Add implicit user action to transcript (Context grounding)
    transcript.push({
        id: `msg-${Date.now()}`,
        speaker: 'user',
        text: `[User showed a photo]: ${analysis.description}`,
        timestamp: new Date().toISOString(),
        isSystemEvent: true
    });

    // 2. Determine the best response
    let responseText = analysis.conversationalTrigger;
    let strategy = 'emotional_deepening';

    if (!responseText) {
        // Fallback: Use the standard generation loop via LLM
        const history = transcript.slice(-5);
        const memories = await this.vectorStore.retrieveContext(session.userId, analysis.description);

        const textPrompt = `
            Context: ${JSON.stringify(history)}
            Memories: ${JSON.stringify(memories)}
            Image: ${analysis.description}
            User showed a photo.
            Generate follow up question JSON: { "text": "...", "strategy": "..." }
        `;
        const response = await this.llm.generateJson<{text: string, strategy: string}>(textPrompt);
        responseText = response.text;
        strategy = response.strategy;
    }

    // 3. Generate Audio
    const audioBuffer = await this.speech.textToSpeech(responseText, strategy);

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
