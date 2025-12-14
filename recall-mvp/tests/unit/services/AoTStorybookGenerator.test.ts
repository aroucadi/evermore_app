import { describe, it, expect, vi, beforeEach } from 'vitest';
import AoTStorybookGenerator from '@/lib/infrastructure/adapters/biographer/AoTStorybookGenerator';

global.fetch = vi.fn();

describe('AoTStorybookGenerator', () => {
  let generator: AoTStorybookGenerator;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key'; // Force bypass of missing key check
    process.env.LLM_PROVIDER = 'openai';
    generator = new AoTStorybookGenerator();
    vi.clearAllMocks();
  });

  const mockChildrensStory = "Once upon a time, Arthur went to work.";
  const mockAdultChapter = "Arthur, a young man of 18, started his job.";

  // Helper to create a successful LLM response
  const createResponse = (content: any) => ({
    ok: true,
    json: async () => ({
      choices: [{
        message: {
          content: typeof content === 'string' ? content : JSON.stringify(content)
        }
      }]
    })
  });

  const mockLLMCall = async (url: string, options: any) => {
    const body = JSON.parse(options.body);
    const content = body.messages[1].content;

    if (content.includes("identify key moments")) {
      return createResponse({ moments: [{ moment: "Arthur walks", importance: 1 }] });
    }
    if (content.includes("extracting visual elements")) {
      return createResponse({ visualElements: ["Factory"] });
    }
    if (content.includes("structuring a children's story")) {
      return createResponse({ beats: [{ beat: "Start", pageRange: "1-2" }] });
    }
    if (content.includes("extracting character details")) {
      return createResponse({ character: { name: "Arthur", age: "18" } });
    }
    if (content.includes("creating a 6-page illustrated children's storybook")) {
      return createResponse({ scenes: [{ pageNumber: 1, moment: "Scene 1" }] });
    }

    return createResponse({});
  };

  it('should decompose story into atoms', async () => {
    (fetch as any).mockImplementation(mockLLMCall);

    const atoms = await generator.decomposeStory(mockChildrensStory, mockAdultChapter);

    expect(atoms.keyMoments).toHaveLength(1);
    expect(atoms.visualElements).toContain("Factory");
    expect(atoms.characterDetails.name).toBe("Arthur");
  });

  it('should synthesize scenes', async () => {
    (fetch as any).mockImplementation(mockLLMCall);

    const atoms = {
      keyMoments: [],
      visualElements: [],
      narrativeBeats: [],
      characterDetails: { name: "Arthur", age: "18", physicalDescription: "", clothingStyle: "", personalityTraits: "" }
    };

    const scenes = await generator.synthesizeScenes(atoms, mockChildrensStory);
    expect(scenes).toHaveLength(1);
    expect(scenes[0].moment).toBe("Scene 1");
  });
});
