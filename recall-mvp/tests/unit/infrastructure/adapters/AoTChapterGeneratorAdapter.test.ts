import { describe, it, expect, vi, beforeEach } from "vitest";
import { AoTChapterGeneratorAdapter } from "@/lib/infrastructure/adapters/ai/AoTChapterGeneratorAdapter";

// Mock global fetch
global.fetch = vi.fn();

describe("AoTChapterGeneratorAdapter", () => {
  let generator: AoTChapterGeneratorAdapter;

  beforeEach(() => {
    generator = new AoTChapterGeneratorAdapter();
    vi.clearAllMocks();
  });

  const mockTranscript = `
    Speaker A: I remember the summer of 69. We were young and restless.
    Speaker B: Tell me more about that.
    Speaker A: We drove to the coast in an old Chevy. The smell of salt and gasoline.
    It was the best time of my life.
  `;

  it("should decompose transcript into atoms", async () => {
    process.env.OPENAI_API_KEY = "test";
    process.env.LLM_PROVIDER = "openai";

    // Mock successful LLM responses for each atom
    // Note: Promise.all order is not guaranteed, but usually matches array order.
    // However, we can use mockImplementation to return based on input content if needed.
    // But for now, let's assume strict order and see.
    // Actually, `callLLM` is what calls fetch.

    // We can just return a generic valid JSON structure that satisfies all parsers
    // or try to match specific calls.

    // Better approach: Mock based on call arguments
    (global.fetch as any).mockImplementation(async (url: string, options: any) => {
        const body = JSON.parse(options.body);
        const content = body.messages[1].content;

        let responseContent = "{}";

        if (content.includes("identify the primary narrative arc")) {
             responseContent = "A summer road trip in 1969.";
        } else if (content.includes("selecting the 2 best quotes")) {
             responseContent = JSON.stringify({ quotes: [{ text: "We were young", reason: "Youth" }] });
        } else if (content.includes("extracting sensory details")) {
             responseContent = JSON.stringify({ sensoryDetails: [{ phrase: "smell of salt", sense: "smell" }] });
        } else if (content.includes("analyzing the emotional tone")) {
             responseContent = JSON.stringify({ emotion: "nostalgia", confidence: 0.9 });
        } else if (content.includes("identifying connections")) {
             responseContent = JSON.stringify({ connections: [] });
        }

        return {
            ok: true,
            json: async () => ({ choices: [{ message: { content: responseContent } }] })
        };
    });


    const atoms = await generator.decomposeTranscript(mockTranscript, []);

    expect(atoms.narrativeArc).toBe("A summer road trip in 1969.");
    expect(atoms.emotionalValence).toBe("nostalgia");
    expect(atoms.bestQuotes).toHaveLength(1);
  });

  it("should synthesize chapter from atoms", async () => {
    process.env.OPENAI_API_KEY = "test";
    process.env.LLM_PROVIDER = "openai";

    const mockAtoms = {
      narrativeArc: "A summer road trip",
      bestQuotes: [],
      sensoryDetails: [],
      emotionalValence: "joy",
      previousChapterConnections: []
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "# Chapter 1\n\nIt was a sunny day..." } }] })
    });

    const chapter = await generator.synthesizeChapter(mockAtoms, mockTranscript);
    expect(chapter).toContain("# Chapter 1");
  });

  it("should handle LLM failures gracefully in decomposition", async () => {
     process.env.OPENAI_API_KEY = "test";
     process.env.LLM_PROVIDER = "openai";

      (global.fetch as any).mockImplementation(async (url: string, options: any) => {
        const body = JSON.parse(options.body);
        const content = body.messages[1].content;

        if (content.includes("identify the primary narrative arc")) {
             throw new Error("API Error"); // SIMULATE FAILURE
        }

        // Return valid empty/default responses for others
        let responseContent = "{}";
        if (content.includes("selecting the 2 best quotes")) responseContent = JSON.stringify({ quotes: [] });
        if (content.includes("extracting sensory details")) responseContent = JSON.stringify({ sensoryDetails: [] });
        if (content.includes("analyzing the emotional tone")) responseContent = JSON.stringify({ emotion: "neutral" });
        if (content.includes("identifying connections")) responseContent = JSON.stringify({ connections: [] });

        return {
            ok: true,
            json: async () => ({ choices: [{ message: { content: responseContent } }] })
        };
    });

      const atoms = await generator.decomposeTranscript(mockTranscript, []);

      // Narrative arc should have fallback
      expect(atoms.narrativeArc).toBeDefined();
      expect(atoms.narrativeArc).toBe('A Memory from the Past');
  });
});
