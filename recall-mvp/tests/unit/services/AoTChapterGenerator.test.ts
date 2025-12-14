import { describe, it, expect, vi, beforeEach } from 'vitest';
import AoTChapterGenerator from '@/lib/services/biographer/AoTChapterGenerator';

// Mock fetch
global.fetch = vi.fn();

describe('AoTChapterGenerator', () => {
  let generator: AoTChapterGenerator;

  beforeEach(() => {
    generator = new AoTChapterGenerator();
    vi.clearAllMocks();
  });

  const mockTranscript = "User: I recall the summer of 69 clearly. Agent: Tell me more. User: It was hot, and we drove to the coast.";

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
    const content = body.messages[1].content; // User prompt

    if (content.includes("identify the primary narrative arc")) {
      return createResponse("The summer road trip of 1969");
    }
    if (content.includes("selecting the 2 best quotes")) {
      return createResponse({ quotes: [{ text: "It was hot", reason: "sensory" }] });
    }
    if (content.includes("extracting sensory details")) {
      return createResponse({ sensoryDetails: [{ sense: "feeling", phrase: "hot", context: "weather" }] });
    }
    if (content.includes("analyzing the emotional tone")) {
      return createResponse({ emotion: "nostalgia", confidence: 0.9 });
    }
    if (content.includes("identifying connections between")) {
      return createResponse({ connections: [] });
    }
    if (content.includes("writing a biographical chapter using ONLY")) {
      return createResponse("# The summer road trip of 1969\n\nChapter content...");
    }

    return createResponse({});
  };

  it('should decompose transcript into atoms', async () => {
    (fetch as any).mockImplementation(mockLLMCall);

    const atoms = await generator.decomposeTranscript(mockTranscript, []);

    expect(atoms.narrativeArc).toBe("The summer road trip of 1969");
    expect(atoms.emotionalValence).toBe("nostalgia");
    expect(atoms.bestQuotes).toHaveLength(1);
  });

  it('should synthesize chapter from atoms', async () => {
    (fetch as any).mockImplementation(mockLLMCall);

    const atoms = {
      narrativeArc: "The summer road trip of 1969",
      bestQuotes: [],
      sensoryDetails: [],
      emotionalValence: "joy",
      previousChapterConnections: []
    };

    const chapter = await generator.synthesizeChapter(atoms, mockTranscript);
    expect(chapter).toContain("# The summer road trip of 1969");
  });

  it('should handle atom failure gracefully', async () => {
    (fetch as any).mockImplementation(async (url: string, options: any) => {
        const body = JSON.parse(options.body);
        const content = body.messages[1].content;

        // Fail the narrative arc call
        if (content.includes("identify the primary narrative arc")) {
            throw new Error("API Error");
        }

        // Pass others
        return mockLLMCall(url, options);
    });

    const atoms = await generator.decomposeTranscript(mockTranscript, []);

    expect(atoms.narrativeArc).toBe("A Memory from the Past"); // Default fallback
    expect(atoms.emotionalValence).toBe("nostalgia"); // Others should succeed
  });
});
