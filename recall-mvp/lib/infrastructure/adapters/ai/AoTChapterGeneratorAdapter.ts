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
  bestQuotes: Array<{ text: string; reason: string }>;
  sensoryDetails: Array<{ sense: string; phrase: string; context: string }>;
  emotionalValence: string;
  previousChapterConnections: Array<{ previousChapter: string; connectionType: string; description: string }>;
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
      const parsed = await this.llm.generateJson<{ quotes: any[] }>(prompt);
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
      const parsed = await this.llm.generateJson<{ sensoryDetails: any[] }>(prompt);
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
  async findPreviousChapterConnections(transcript: string, previousChapters: Array<{ title: string; summary: string }>): Promise<AtomicResult> {
    if (!previousChapters.length) return { atomId: 'previousChapterConnections', output: [], success: true };

    const context = previousChapters.map((ch, i) => `Ch${i + 1}: ${ch.title} - ${ch.summary}`).join('\n');
    const prompt = `
Identify connections between current transcript and previous chapters.
TRANSCRIPT: ${transcript}
PREVIOUS: ${context}
OUTPUT JSON: { "connections": [{ "previousChapter": "...", "connectionType": "...", "description": "..." }] }
`;
    try {
      const parsed = await this.llm.generateJson<{ connections: any[] }>(prompt);
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
You are a masterful storyteller creating an immersive audio biography chapter that will be READ ALOUD.

ANALYSIS INSIGHTS:
- Core Narrative: ${atoms.narrativeArc}
- Primary Emotion: ${atoms.emotionalValence}
- Best Quotes to Weave In: ${JSON.stringify(atoms.bestQuotes)}
- Sensory Details to Include: ${JSON.stringify(atoms.sensoryDetails)}
- Connections to Previous Chapters: ${JSON.stringify(atoms.previousChapterConnections)}

ORIGINAL TRANSCRIPT (for authenticity):
${transcript.substring(0, 1500)}

WRITING GUIDELINES FOR AUDIO STORYTELLING:

1. **TITLE**: Create an evocative, poetic chapter title (no "Chapter X:" prefix - just the title)

2. **OPENING HOOK** (1-2 sentences): 
   - Start with a sensory moment or emotional beat
   - Draw the listener in immediately
   - Example: "The smell of fresh bread still takes me back to that kitchen..."

3. **SCENE SETTING** (1-2 paragraphs):
   - Ground the listener in time and place
   - Use vivid sensory language (what they'd see, hear, smell)
   - Set the emotional atmosphere

4. **STORY BODY** (3-4 paragraphs):
   - Weave the narrative naturally as if speaking to a grandchild
   - Include direct quotes where authentic (marked with quotation marks)
   - Build emotional momentum through pacing
   - Use short sentences for impact, longer ones for flow
   - Add natural pauses with "..." for dramatic effect

5. **EMOTIONAL CLIMAX** (1 paragraph):
   - The heart of the story - the moment that matters most
   - Slow down here, make every word count
   - Connect to universal human experiences

6. **CLOSING REFLECTION** (1-2 sentences):
   - A warm, reflective ending
   - Something the listener will remember
   - Can tie back to the opening or look forward

AUDIO-FRIENDLY WRITING RULES:
- NO markdown headers (##), NO asterisks (*), NO bullet points
- Write in natural paragraphs, separated by blank lines
- Use em-dashes (—) sparingly for emphasis pauses
- Numbers should be written as words (e.g., "twenty-three" not "23")
- Avoid abbreviations (write "Mister" not "Mr.")
- Use ellipsis (...) for thoughtful pauses

TONE: Warm, intimate, as if telling a story by firelight. This is a treasured family memory.

LENGTH: 400-600 words, well-paced for 3-4 minutes of listening.

Now write the chapter. Begin directly with the title, then the story:
`;
    return await this.llm.generateText(prompt, { maxTokens: 1200 });
  }

  async generateChapter(transcript: string, previousChapters: any[] = []): Promise<ChapterGeneratorResult> {
    const atoms = await this.decomposeTranscript(transcript, previousChapters);
    const chapter = await this.synthesizeChapter(atoms, transcript);
    return { chapter, atoms };
  }
}
