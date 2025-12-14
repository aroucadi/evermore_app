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
}

class AoTChapterGenerator {

  /**
   * ATOM 1: Extract Primary Narrative Arc
   *
   * PURPOSE: Identify the main story/theme in one clear sentence
   * INPUT: Full conversation transcript
   * OUTPUT: Single sentence describing what this conversation is about
   *
   * CONSTRAINTS:
   * - Must be 10-20 words
   * - Must be specific (not vague like "Arthur's memories")
   * - Should capture the TIME and PLACE if mentioned
   */
  async extractNarrativeArc(transcript: string): Promise<AtomicResult> {
    const prompt = `
You are analyzing a conversation transcript to identify the primary narrative arc.

TRANSCRIPT:
${transcript}

TASK: Write ONE sentence (10-20 words) that captures the main story or theme.

REQUIREMENTS:
- Be specific: Include time period, location, or key event if mentioned
- Examples of GOOD outputs:
  * "Arthur's first job as a mechanic at Ford plant in 1952"
  * "The summer road trip to California with his late wife in 1965"
  * "Growing up on a farm in rural Michigan during the Depression"
- Examples of BAD outputs:
  * "Arthur's memories" (too vague)
  * "A story about work" (no specifics)

OUTPUT FORMAT: Just the sentence, nothing else.
`;

    try {
      const response = await this.callLLM(prompt, { maxTokens: 50 });
      return {
        atomId: 'narrativeArc',
        output: response.trim(),
        success: true
      };
    } catch (error: any) {
      return {
        atomId: 'narrativeArc',
        output: '',
        success: false,
        errorMessage: error.message
      };
    }
  }

  /**
   * ATOM 2: Select Best Quotes
   *
   * PURPOSE: Find 2 quotes that are emotionally resonant and vivid
   * INPUT: Full conversation transcript
   * OUTPUT: Array of 2 quote objects with text
   *
   * CONSTRAINTS:
   * - Each quote must be 10-30 seconds when spoken (~20-60 words)
   * - Must contain sensory language OR emotional expression
   * - Must be verbatim from transcript (zero fabrication)
   * - If transcript has no good quotes, return empty array
   */
  async selectBestQuotes(transcript: string): Promise<AtomicResult> {
    const prompt = `
You are selecting the 2 best quotes from a conversation for a biographical chapter.

TRANSCRIPT:
${transcript}

SELECTION CRITERIA (ranked by importance):
1. Emotional resonance: Contains laughter, tears, excitement, or deep feeling
2. Sensory language: Describes smell, sound, texture, color, taste
3. Character-revealing: Shows personality, values, humor, or wisdom
4. Length: 20-60 words (roughly 10-30 seconds when spoken)

TASK: Select exactly 2 quotes that best meet these criteria.

OUTPUT FORMAT (JSON only):
{
  "quotes": [
    {
      "text": "verbatim quote from transcript",
      "reason": "why this quote was selected (one sentence)"
    },
    {
      "text": "verbatim quote from transcript",
      "reason": "why this quote was selected (one sentence)"
    }
  ]
}

CRITICAL RULES:
- Quotes must be EXACT text from transcript (no paraphrasing)
- If no quotes meet criteria, return empty array: {"quotes": []}
- Never fabricate or modify quotes
`;

    try {
      const response = await this.callLLM(prompt, { maxTokens: 300, format: 'json' });
      const parsed = JSON.parse(response);
      return {
        atomId: 'bestQuotes',
        output: parsed.quotes || [],
        success: true
      };
    } catch (error: any) {
      return {
        atomId: 'bestQuotes',
        output: [],
        success: false,
        errorMessage: error.message
      };
    }
  }

  /**
   * ATOM 3: Extract Sensory Details
   *
   * PURPOSE: Identify vivid sensory language used in conversation
   * INPUT: Full conversation transcript
   * OUTPUT: Array of sensory phrases organized by sense type
   *
   * CONSTRAINTS:
   * - Only include phrases that describe sight, sound, smell, touch, taste
   * - Must be verbatim from transcript
   * - Return at least 3, maximum 10 details
   */
  async extractSensoryDetails(transcript: string): Promise<AtomicResult> {
    const prompt = `
You are extracting sensory details from a conversation transcript.

TRANSCRIPT:
${transcript}

TASK: Find all phrases where the speaker describes what they SAW, HEARD, SMELLED, TOUCHED, or TASTED.

OUTPUT FORMAT (JSON only):
{
  "sensoryDetails": [
    {
      "sense": "smell|sound|sight|touch|taste",
      "phrase": "exact phrase from transcript",
      "context": "brief context (3-5 words)"
    }
  ]
}

EXAMPLES OF GOOD EXTRACTIONS:
- "motor oil, hot metal, cigarette smoke all mixed together" → smell
- "deafening presses banging, engines roaring" → sound
- "rough calloused hands from years of work" → touch

RULES:
- Minimum 3 details, maximum 10
- Phrases must be verbatim from transcript
- If no sensory language exists, return empty array
`;

    try {
      const response = await this.callLLM(prompt, { maxTokens: 400, format: 'json' });
      const parsed = JSON.parse(response);
      return {
        atomId: 'sensoryDetails',
        output: parsed.sensoryDetails || [],
        success: true
      };
    } catch (error: any) {
      return {
        atomId: 'sensoryDetails',
        output: [],
        success: false,
        errorMessage: error.message
      };
    }
  }

  /**
   * ATOM 4: Determine Emotional Valence
   *
   * PURPOSE: Classify the overall emotional tone of the conversation
   * INPUT: Full conversation transcript
   * OUTPUT: Single emotion label with confidence score
   *
   * CONSTRAINTS:
   * - Must choose ONE primary emotion from predefined list
   * - Return confidence score 0-1
   */
  async determineEmotionalValence(transcript: string): Promise<AtomicResult> {
    const prompt = `
You are analyzing the emotional tone of a conversation.

TRANSCRIPT:
${transcript}

TASK: Determine the PRIMARY emotional valence.

ALLOWED EMOTIONS (choose exactly ONE):
- "joy" - Happiness, laughter, delight
- "pride" - Accomplishment, satisfaction, success
- "nostalgia" - Wistful longing, sweet memories
- "bittersweet" - Mix of happiness and sadness
- "gratitude" - Thankfulness, appreciation
- "love" - Affection, warmth toward others
- "sadness" - Grief, loss, melancholy
- "neutral" - Factual recounting without strong emotion

OUTPUT FORMAT (JSON only):
{
  "emotion": "one of the allowed emotions",
  "confidence": 0.85,
  "evidence": "brief explanation why (one sentence)"
}

RULES:
- If multiple emotions present, choose the DOMINANT one
- Confidence should reflect how clear the emotion is (0.5-1.0)
`;

    try {
      const response = await this.callLLM(prompt, { maxTokens: 100, format: 'json' });
      const parsed = JSON.parse(response);
      return {
        atomId: 'emotionalValence',
        output: parsed,
        success: true
      };
    } catch (error: any) {
      return {
        atomId: 'emotionalValence',
        output: { emotion: 'neutral', confidence: 0.5, evidence: 'Unable to determine' },
        success: false,
        errorMessage: error.message
      };
    }
  }

  /**
   * ATOM 5: Find Previous Chapter Connections
   *
   * PURPOSE: Identify how current conversation relates to past chapters
   * INPUT: Current transcript + summaries of previous chapters
   * OUTPUT: Array of connection descriptions
   *
   * CONSTRAINTS:
   * - Only mention connections if genuinely relevant
   * - Return empty array if no meaningful connections exist
   * - Maximum 3 connections
   */
  async findPreviousChapterConnections(
    transcript: string,
    previousChapters: Array<{title: string; summary: string}>
  ): Promise<AtomicResult> {

    // If no previous chapters, skip this atom
    if (!previousChapters || previousChapters.length === 0) {
      return {
        atomId: 'previousChapterConnections',
        output: [],
        success: true
      };
    }

    const previousContext = previousChapters
      .map((ch, i) => `Chapter ${i+1}: ${ch.title}\nSummary: ${ch.summary}`)
      .join('\n\n');

    const prompt = `
You are identifying connections between a current conversation and previous biographical chapters.

CURRENT CONVERSATION:
${transcript}

PREVIOUS CHAPTERS:
${previousContext}

TASK: Identify up to 3 meaningful connections.

WHAT COUNTS AS A CONNECTION:
- Current conversation mentions a person/place/event from previous chapter
- Current story provides new detail about something mentioned before
- Current memory contradicts or clarifies previous information

OUTPUT FORMAT (JSON only):
{
  "connections": [
    {
      "previousChapter": "chapter title",
      "connectionType": "same_person|same_place|same_time_period|continuation|contradiction",
      "description": "brief description (one sentence)"
    }
  ]
}

RULES:
- Only include GENUINE connections (don't force it)
- Maximum 3 connections
- If no connections exist, return empty array: {"connections": []}
`;

    try {
      const response = await this.callLLM(prompt, { maxTokens: 300, format: 'json' });
      const parsed = JSON.parse(response);
      return {
        atomId: 'previousChapterConnections',
        output: parsed.connections || [],
        success: true
      };
    } catch (error: any) {
      return {
        atomId: 'previousChapterConnections',
        output: [],
        success: false,
        errorMessage: error.message
      };
    }
  }

  /**
   * PHASE 1: Execute All Atoms in Parallel
   */
  async decomposeTranscript(
    transcript: string,
    previousChapters: Array<{title: string; summary: string}>
  ): Promise<ChapterAtoms> {

    console.log('🧪 AoT Phase 1: Decomposing transcript into atomic tasks...');

    // Execute all atoms in parallel for speed
    const [
      narrativeResult,
      quotesResult,
      sensoryResult,
      emotionResult,
      connectionsResult
    ] = await Promise.all([
      this.extractNarrativeArc(transcript),
      this.selectBestQuotes(transcript),
      this.extractSensoryDetails(transcript),
      this.determineEmotionalValence(transcript),
      this.findPreviousChapterConnections(transcript, previousChapters)
    ]);

    // Log any failures
    const allResults = [narrativeResult, quotesResult, sensoryResult, emotionResult, connectionsResult];
    const failures = allResults.filter(r => !r.success);
    if (failures.length > 0) {
      console.warn('⚠️ Some atoms failed:', failures.map(f => f.atomId));
    }

    // Assemble atoms (use defaults for failed atoms)
    return {
      narrativeArc: narrativeResult.success ? narrativeResult.output : 'A Memory from the Past',
      bestQuotes: quotesResult.success ? quotesResult.output : [],
      sensoryDetails: sensoryResult.success ? sensoryResult.output : [],
      emotionalValence: emotionResult.success ? emotionResult.output.emotion : 'neutral',
      previousChapterConnections: connectionsResult.success ? connectionsResult.output : []
    };
  }

  /**
   * PHASE 2: CONTRACT (Synthesize Final Chapter)
   *
   * PURPOSE: Use ONLY the atomic outputs to generate final chapter
   * INPUT: ChapterAtoms object with all decomposed elements
   * OUTPUT: Complete 300-500 word biographical chapter
   *
   * CONSTRAINTS:
   * - Must use provided atoms (no additional inference)
   * - Follow exact structure: Opening → Body → Closing
   * - Include verbatim quotes from atoms
   * - Reference sensory details from atoms
   * - Mention previous chapter connections if provided
   */
  async synthesizeChapter(
    atoms: ChapterAtoms,
    transcript: string
  ): Promise<string> {

    console.log('🔬 AoT Phase 2: Synthesizing final chapter from atoms...');

    const quotesSection = atoms.bestQuotes.length > 0
      ? `QUOTES TO INCLUDE (verbatim in italics):
${atoms.bestQuotes.map((q, i) => `Quote ${i+1}: "${q.text}"`).join('\n')}`
      : 'QUOTES: None available, write without quotes';

    const sensorySection = atoms.sensoryDetails.length > 0
      ? `SENSORY DETAILS TO WEAVE IN:
${atoms.sensoryDetails.map(s => `- ${s.phrase} (${s.sense})`).join('\n')}`
      : 'SENSORY DETAILS: None available, use general descriptions';

    const connectionsSection = atoms.previousChapterConnections.length > 0
      ? `PREVIOUS CHAPTER CONNECTIONS TO MENTION:
${atoms.previousChapterConnections.map(c => `- ${c.description}`).join('\n')}`
      : 'PREVIOUS CHAPTERS: This is standalone, no references needed';

    const prompt = `
You are writing a biographical chapter using ONLY the provided atomic components.

ATOMIC INPUTS:

NARRATIVE ARC (use as chapter title):
${atoms.narrativeArc}

EMOTIONAL TONE:
${atoms.emotionalValence}

${quotesSection}

${sensorySection}

${connectionsSection}

ORIGINAL TRANSCRIPT (for context only, do not extract new information):
${transcript.substring(0, 2000)}... [truncated]

---

TASK: Write a 300-500 word biographical chapter following this EXACT structure:

# [Title from Narrative Arc]

[OPENING PARAGRAPH]
- Set the scene: When and where did this take place?
- Establish context: What was significant about this time in their life?
- 1-2 sentences

[BODY - 2-3 PARAGRAPHS]
- Tell the story chronologically or thematically
- Weave in sensory details naturally
- Include 1-2 verbatim quotes in italics (if provided)
- Mention previous chapter connections naturally (if provided)
- Focus on emotional truth over factual precision

[CLOSING PARAGRAPH]
- Reflect on what this memory means
- Connect to broader life themes or values
- Leave reader with emotional resonance
- 1-2 sentences

---

CRITICAL RULES:
1. Use ONLY information from the atomic inputs above
2. Do NOT invent details not in atoms or transcript
3. Quotes must be verbatim in italics: *"exact quote here"*
4. Word count: 300-500 words (strict)
5. Tone: Warm, respectful, narrative non-fiction style
6. If uncertain about detail, use softening language: "Arthur remembers..." or "Around that time..."

OUTPUT: Just the chapter text with markdown formatting. No preamble.
`;

    const chapter = await this.callLLM(prompt, { maxTokens: 800 });

    console.log('✅ Chapter synthesis complete');
    return chapter.trim();
  }

  /**
   * MAIN ENTRY POINT: Generate Chapter with AoT
   */
  async generateChapter(
    transcript: string,
    previousChapters: Array<{title: string; summary: string}> = []
  ): Promise<{chapter: string; atoms: ChapterAtoms}> {

    console.log('🚀 Starting AoT Chapter Generation...');

    // Phase 1: Decompose
    const atoms = await this.decomposeTranscript(transcript, previousChapters);

    // Phase 2: Contract
    const chapter = await this.synthesizeChapter(atoms, transcript);

    console.log('✅ AoT Chapter Generation complete');

    return { chapter, atoms };
  }

  /**
   * Helper: Call LLM (use free model)
   */
  private async callLLM(
    prompt: string,
    options: {maxTokens?: number; format?: 'text' | 'json'} = {}
  ): Promise<string> {

    // Use Groq Llama 3.1 70B (free, unlimited)
    // Fallback to GPT-4o-mini if Groq fails

    const model = process.env.LLM_PROVIDER === 'openai'
      ? 'gpt-4o-mini'
      : 'llama-3.1-70b-versatile'; // Groq model

    const apiKey = process.env.LLM_PROVIDER === 'openai'
        ? process.env.OPENAI_API_KEY
        : process.env.GROQ_API_KEY;

    // Use mock behavior if no API keys available
    if (!apiKey) {
        console.warn('No LLM API key found, returning mock response for testing.');
        if (options.format === 'json') {
            return JSON.stringify({});
        }
        return "Mock LLM Response";
    }

    const url = process.env.LLM_PROVIDER === 'openai'
        ? 'https://api.openai.com/v1/chat/completions'
        : 'https://api.groq.com/openai/v1/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant that follows instructions precisely.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: options.maxTokens || 500,
        temperature: 0.7,
        ...(options.format === 'json' ? { response_format: { type: 'json_object' } } : {})
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

export default AoTChapterGenerator;
