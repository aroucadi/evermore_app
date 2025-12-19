import { ChapterGeneratorPort, ChapterGeneratorResult } from '../../../core/application/ports/ChapterGeneratorPort';
import { LLMPort } from '../../../core/application/ports/LLMPort';

interface AtomicResult {
  atomId: string;
  output: any;
  success: boolean;
  errorMessage?: string;
}

interface ChapterAtoms {
  narrativeArc: string;
  bestQuotes: Array<{text: string; reason: string}>;
  sensoryDetails: Array<{sense: string; phrase: string; context: string}>;
  emotionalValence: string;
  previousChapterConnections: Array<{previousChapter: string; connectionType: string; description: string}>;
  [key: string]: any;
}

export class AoTChapterGeneratorAdapter implements ChapterGeneratorPort {
  private llm: LLMPort;

  constructor(llm: LLMPort) {
      this.llm = llm;
  }

  // ATOM 1: Narrative Arc
  async extractNarrativeArc(transcript: string): Promise<AtomicResult> {
    const prompt = `
You are analyzing a conversation transcript to identify the primary narrative arc.
TRANSCRIPT: ${transcript}
TASK: Write ONE sentence (10-20 words) that captures the main story or theme.
OUTPUT FORMAT: Just the sentence, nothing else.
`;
    try {
      const response = await this.llm.generateText(prompt, { maxTokens: 50 });
      return { atomId: 'narrativeArc', output: response.trim(), success: true };
    } catch (error: any) {
      return { atomId: 'narrativeArc', output: '', success: false, errorMessage: error.message };
    }
  }

  // ATOM 2: Best Quotes
  async selectBestQuotes(transcript: string): Promise<AtomicResult> {
    const prompt = `
You are selecting the 2 best quotes from a conversation.
TRANSCRIPT: ${transcript}
CRITERIA: Emotional resonance, sensory language.
OUTPUT JSON: { "quotes": [{ "text": "...", "reason": "..." }] }
`;
    try {
      const parsed = await this.llm.generateJson<{quotes: any[]}>(prompt);
      return { atomId: 'bestQuotes', output: parsed.quotes || [], success: true };
    } catch (error: any) {
      return { atomId: 'bestQuotes', output: [], success: false, errorMessage: error.message };
    }
  }

  // ATOM 3: Sensory Details
  async extractSensoryDetails(transcript: string): Promise<AtomicResult> {
    const prompt = `
Find sensory details (sight, sound, smell, etc).
TRANSCRIPT: ${transcript}
OUTPUT JSON: { "sensoryDetails": [{ "sense": "...", "phrase": "...", "context": "..." }] }
`;
    try {
        const parsed = await this.llm.generateJson<{sensoryDetails: any[]}>(prompt);
        return { atomId: 'sensoryDetails', output: parsed.sensoryDetails || [], success: true };
    } catch (error: any) {
      return { atomId: 'sensoryDetails', output: [], success: false, errorMessage: error.message };
    }
  }

  // ATOM 4: Emotional Valence
  async determineEmotionalValence(transcript: string): Promise<AtomicResult> {
    const prompt = `
Determine the primary emotional valence (joy, pride, nostalgia, etc).
TRANSCRIPT: ${transcript}
OUTPUT JSON: { "emotion": "...", "confidence": 0.85, "evidence": "..." }
`;
    try {
        const parsed = await this.llm.generateJson<any>(prompt);
        return { atomId: 'emotionalValence', output: parsed, success: true };
    } catch (error: any) {
      return { atomId: 'emotionalValence', output: { emotion: 'neutral' }, success: false, errorMessage: error.message };
    }
  }

  // ATOM 5: Connections
  async findPreviousChapterConnections(transcript: string, previousChapters: Array<{title: string; summary: string}>): Promise<AtomicResult> {
    if (!previousChapters.length) return { atomId: 'previousChapterConnections', output: [], success: true };

    const context = previousChapters.map((ch, i) => `Ch${i+1}: ${ch.title} - ${ch.summary}`).join('\n');
    const prompt = `
Identify connections between current transcript and previous chapters.
TRANSCRIPT: ${transcript}
PREVIOUS: ${context}
OUTPUT JSON: { "connections": [{ "previousChapter": "...", "connectionType": "...", "description": "..." }] }
`;
    try {
        const parsed = await this.llm.generateJson<{connections: any[]}>(prompt);
        return { atomId: 'previousChapterConnections', output: parsed.connections || [], success: true };
    } catch (error: any) {
      return { atomId: 'previousChapterConnections', output: [], success: false, errorMessage: error.message };
    }
  }

  async decomposeTranscript(transcript: string, previousChapters: any[]): Promise<ChapterAtoms> {
      const results = await Promise.all([
          this.extractNarrativeArc(transcript),
          this.selectBestQuotes(transcript),
          this.extractSensoryDetails(transcript),
          this.determineEmotionalValence(transcript),
          this.findPreviousChapterConnections(transcript, previousChapters)
      ]);

      const [narrative, quotes, sensory, emotion, connections] = results;

      return {
          narrativeArc: narrative.success ? narrative.output : 'Memory',
          bestQuotes: quotes.success ? quotes.output : [],
          sensoryDetails: sensory.success ? sensory.output : [],
          emotionalValence: emotion.success ? emotion.output.emotion : 'neutral',
          previousChapterConnections: connections.success ? connections.output : []
      };
  }

  async synthesizeChapter(atoms: ChapterAtoms, transcript: string): Promise<string> {
      const prompt = `
Write a biography chapter based on these atoms.
Narrative: ${atoms.narrativeArc}
Emotion: ${atoms.emotionalValence}
Quotes: ${JSON.stringify(atoms.bestQuotes)}
Sensory: ${JSON.stringify(atoms.sensoryDetails)}
Context: ${JSON.stringify(atoms.previousChapterConnections)}
Original Transcript Segment: ${transcript.substring(0, 1000)}...

Write 300-500 words. Markdown.
`;
      return await this.llm.generateText(prompt, { maxTokens: 1000 });
  }

  async generateChapter(transcript: string, previousChapters: any[] = []): Promise<ChapterGeneratorResult> {
      const atoms = await this.decomposeTranscript(transcript, previousChapters);
      const chapter = await this.synthesizeChapter(atoms, transcript);
      return { chapter, atoms };
  }
}
