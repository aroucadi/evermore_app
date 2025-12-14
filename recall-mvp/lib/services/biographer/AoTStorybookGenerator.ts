interface StorybookAtoms {
  keyMoments: Array<{moment: string; importance: number; reasoning: string}>;
  visualElements: string[];
  narrativeBeats: Array<{beat: string; pageRange: string; purpose: string}>;
  characterDetails: {name: string; age: string; physicalDescription: string; clothingStyle: string; personalityTraits: string};
}

class AoTStorybookGenerator {

  /**
   * ATOM 1: Identify Key Moments
   *
   * PURPOSE: Find the 6-8 most important moments in the story
   * INPUT: Children's version of chapter
   * OUTPUT: Ranked list of moments with importance scores
   */
  async identifyKeyMoments(childrensStory: string): Promise<any[]> {
    const prompt = `
You are analyzing a children's story to identify key moments for illustration.

STORY:
${childrensStory}

TASK: Extract 6-8 key moments that are:
1. Visually interesting (can be drawn)
2. Story-critical (advance the narrative)
3. Emotionally significant (exciting, touching, surprising)

OUTPUT FORMAT (JSON):
{
  "moments": [
    {
      "moment": "brief description (5-8 words)",
      "importance": 0.9,
      "reasoning": "why this moment matters (one sentence)"
    }
  ]
}

EXAMPLES OF GOOD MOMENTS:
- "Young Arthur walking toward factory entrance"
- "First handshake with foreman Bill"
- "Arthur fixing his first engine proudly"

EXAMPLES OF BAD MOMENTS:
- "Arthur thinking about things" (not visual)
- "Narrator explaining context" (not story action)

RULES:
- Must be visual (people, places, actions)
- Importance score: 0-1 (1 = critical, 0.5 = nice-to-have)
- Extract 6-8 moments minimum
`;

    const response = await this.callLLM(prompt, { format: 'json' });
    const parsed = JSON.parse(response);
    return parsed.moments || [];
  }

  /**
   * ATOM 2: Extract Visual Elements
   *
   * PURPOSE: Identify recurring visual elements for illustration consistency
   * INPUT: Children's version of chapter
   * OUTPUT: List of key visual elements (settings, objects, people)
   */
  async extractVisualElements(childrensStory: string): Promise<string[]> {
    const prompt = `
You are extracting visual elements from a children's story for illustration purposes.

STORY:
${childrensStory}

TASK: List all important VISUAL ELEMENTS that should appear consistently across illustrations.

CATEGORIES:
1. Setting: Where does the story take place?
2. Key Objects: What important objects are mentioned?
3. People: Who appears in the story?
4. Time Period: What era is this?

OUTPUT FORMAT (JSON):
{
  "visualElements": [
    "large factory building with smokestacks",
    "vintage 1950s work clothes",
    "machinery and tools",
    "blue Chevrolet car",
    "elderly man with kind face"
  ]
}

RULES:
- Be specific enough for an artist to draw
- Include time period indicators (1950s, Victorian, modern)
- Maximum 8 elements
`;

    const response = await this.callLLM(prompt, { format: 'json' });
    const parsed = JSON.parse(response);
    return parsed.visualElements || [];
  }

  /**
   * ATOM 3: Define Narrative Beats
   *
   * PURPOSE: Structure story into clear beginning/middle/end
   * INPUT: Children's version of chapter
   * OUTPUT: 3-4 narrative beats with suggested page placement
   */
  async defineNarrativeBeats(childrensStory: string): Promise<any[]> {
    const prompt = `
You are structuring a children's story into narrative beats for a 6-page book.

STORY:
${childrensStory}

TASK: Break the story into 3-4 narrative beats that form a clear arc.

NARRATIVE STRUCTURE:
1. Opening/Setup (pages 1-2)
2. Rising Action (pages 3-4)
3. Climax/Resolution (page 5)
4. Closing/Reflection (page 6)

OUTPUT FORMAT (JSON):
{
  "beats": [
    {
      "beat": "Arthur arrives at factory for first day",
      "pageRange": "1-2",
      "purpose": "setup"
    },
    {
      "beat": "Arthur learns from foreman Bill",
      "pageRange": "3-4",
      "purpose": "rising_action"
    }
  ]
}

RULES:
- 3-4 beats maximum
- Each beat should span 1-2 pages
- Must cover entire story (no gaps)
`;

    const response = await this.callLLM(prompt, { format: 'json' });
    const parsed = JSON.parse(response);
    return parsed.beats || [];
  }

  /**
   * ATOM 4: Extract Character Details
   *
   * PURPOSE: Define protagonist's appearance for consistent illustration
   * INPUT: Original adult chapter (has more detail)
   * OUTPUT: Character description for artist prompt
   */
  async extractCharacterDetails(adultChapter: string): Promise<any> {
    const prompt = `
You are extracting character details for illustration purposes.

CHAPTER:
${adultChapter}

TASK: Describe the main character's appearance based on clues in the text.

OUTPUT FORMAT (JSON):
{
  "character": {
    "name": "Arthur",
    "age": "young man (18-25)" or "elderly (70-85)",
    "physicalDescription": "brief description for artist",
    "clothingStyle": "era-appropriate clothing description",
    "personalityTraits": "visual traits (warm smile, strong hands, etc.)"
  }
}

RULES:
- Only use details mentioned in text
- If details unclear, use "not specified"
- Focus on visually drawable traits
- Include age/era for context

EXAMPLE OUTPUT:
{
  "character": {
    "name": "Arthur",
    "age": "young man (18)",
    "physicalDescription": "tall, strong build from farm work",
    "clothingStyle": "1950s factory worker - denim shirt, work boots",
    "personalityTraits": "eager expression, bright eyes, nervous energy"
  }
}
`;

    const response = await this.callLLM(prompt, { format: 'json' });
    const parsed = JSON.parse(response);
    return parsed.character || {};
  }

  /**
   * PHASE 1: Decompose Story Elements
   */
  async decomposeStory(
    childrensStory: string,
    adultChapter: string
  ): Promise<StorybookAtoms> {

    console.log('🧪 AoT Phase 1: Decomposing story into atomic elements...');

    const [
      keyMoments,
      visualElements,
      narrativeBeats,
      characterDetails
    ] = await Promise.all([
      this.identifyKeyMoments(childrensStory),
      this.extractVisualElements(childrensStory),
      this.defineNarrativeBeats(childrensStory),
      this.extractCharacterDetails(adultChapter)
    ]);

    return {
      keyMoments,
      visualElements,
      narrativeBeats,
      characterDetails
    };
  }

  /**
   * PHASE 2: CONTRACT into 4-6 Scenes
   *
   * PURPOSE: Select optimal moments and create scene descriptions
   * INPUT: StorybookAtoms
   * OUTPUT: Array of 4-6 scenes ready for illustration
   */
  async synthesizeScenes(
    atoms: StorybookAtoms,
    childrensStory: string
  ): Promise<any[]> {

    console.log('🔬 AoT Phase 2: Synthesizing final scene sequence...');

    const prompt = `
You are creating a 6-page illustrated children's storybook using atomic story elements.

ATOMIC INPUTS:

KEY MOMENTS (ranked by importance):
${atoms.keyMoments.map((m, i) => `${i+1}. ${m.moment} (importance: ${m.importance})`).join('\n')}

VISUAL ELEMENTS TO INCLUDE:
${atoms.visualElements.join(', ')}

NARRATIVE BEATS:
${atoms.narrativeBeats.map(b => `${b.beat} (pages ${b.pageRange})`).join('\n')}

CHARACTER:
${atoms.characterDetails.name}, ${atoms.characterDetails.age}
Appearance: ${atoms.characterDetails.physicalDescription}
Style: ${atoms.characterDetails.clothingStyle}

CHILDREN'S STORY TEXT:
${childrensStory}

---

TASK: Select exactly 6 moments to illustrate across 6 pages.

REQUIREMENTS:
1. Cover the narrative arc (beginning → middle → end)
2. Choose visually diverse scenes (vary settings/actions)
3. Prioritize high-importance moments
4. Ensure character appears in most scenes
5. Include visual elements consistently

OUTPUT FORMAT (JSON):
{
  "scenes": [
    {
      "pageNumber": 1,
      "moment": "Young Arthur walking toward factory entrance",
      "imagePrompt": "Detailed prompt for AI image generation",
      "storyText": "Text to appear on this page (2-3 sentences)",
      "visualElements": ["factory building", "morning light", "1950s clothing"]
    }
  ]
}

IMAGE PROMPT GUIDELINES:
- Start with art style: "Warm watercolor children's book illustration"
- Describe scene clearly
- Include character details for consistency
- Specify mood/lighting
- End with: "No text, no speech bubbles, family-friendly"

EXAMPLE IMAGE PROMPT:
"Warm watercolor children's book illustration. Young man (Arthur, 18 years old) in 1950s denim work shirt walks eagerly toward large brick factory building with smokestacks. Morning sunlight, optimistic mood. Character has short dark hair, strong build, eager expression. Industrial Midwest setting, 1950s era. No text, no speech bubbles, family-friendly, nostalgic style similar to 'The Little Prince'."

OUTPUT: JSON with exactly 6 scenes.
`;

    const response = await this.callLLM(prompt, { format: 'json', maxTokens: 1500 });
    const parsed = JSON.parse(response);
    return parsed.scenes || [];
  }

  /**
   * MAIN ENTRY POINT: Generate Storybook Scenes with AoT
   */
  async generateStorybookScenes(
    childrensStory: string,
    adultChapter: string
  ): Promise<{scenes: any[]; atoms: StorybookAtoms}> {

    console.log('🚀 Starting AoT Storybook Scene Generation...');

    // Phase 1: Decompose
    const atoms = await this.decomposeStory(childrensStory, adultChapter);

    // Phase 2: Contract
    const scenes = await this.synthesizeScenes(atoms, childrensStory);

    console.log('✅ AoT Storybook Scene Generation complete');

    return { scenes, atoms };
  }

  /**
   * Helper: Call LLM (reuse from chapter generator)
   */
  private async callLLM(
    prompt: string,
    options: {maxTokens?: number; format?: 'text' | 'json'} = {}
  ): Promise<string> {
    const model = process.env.LLM_PROVIDER === 'openai'
      ? 'gpt-4o-mini'
      : 'llama-3.1-70b-versatile'; // Groq model

    const apiKey = process.env.LLM_PROVIDER === 'openai'
        ? process.env.OPENAI_API_KEY
        : process.env.GROQ_API_KEY;

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

export default AoTStorybookGenerator;
