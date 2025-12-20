import { directorService, safetyMonitor, llmProvider, speechProvider, chapterGenerator, vectorStore, aiService } from '../lib/infrastructure/di/container';
import { StartSessionUseCase } from '../lib/core/application/use-cases/StartSessionUseCase';
import { GenerateChapterUseCase } from '../lib/core/application/use-cases/GenerateChapterUseCase';

async function main() {
  console.log("=== Verifying Production Readiness ===");

  // 1. Check Adapters
  console.log("\n[Checking Adapters]");
  console.log(`LLM Provider: ${llmProvider.constructor.name}`);
  console.log(`Speech Provider: ${speechProvider.constructor.name}`);
  console.log(`Vector Store: ${vectorStore.constructor.name}`);

  // 2. Check Environment Variables (Critical for Prod)
  const requiredVars = [
    'GOOGLE_CLOUD_PROJECT',
    'ELEVENLABS_API_KEY',
    'ELEVENLABS_AGENT_ID',
    'PINECONE_API_KEY',
    'OPENAI_API_KEY' // For Embeddings/STT fallback
  ];

  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.warn(`\n[WARNING] Missing Production Keys: ${missing.join(', ')}`);
    console.warn("Feature implementations will likely fallback to mocks or fail.");
  } else {
    console.log("\n[OK] All critical API keys present.");
  }

  // 3. Simulate Session Start (Director Service)
  console.log("\n[Simulating Session Start - SYS-03/S-01]");
  try {
      // We pass mock data since we don't want to hit real DB
      const result = await directorService.startSession(
          "user-1",
          "session-1",
          "Alice",
          [],
          undefined // No image
      );
      console.log("Director Strategy Result:", result ? "Success" : "Failed");
  } catch (e) {
      console.error("Director Service Check Failed:", e);
  }

  // 4. Simulate Safety Check (F-01/SYS-02)
  console.log("\n[Simulating Safety Check - F-01]");
  try {
      const isRisky = await safetyMonitor.monitor("I feel great today", "user-1", "session-1");
      console.log("Safety Check (Safe):", isRisky === false ? "Pass" : "Fail");

      const isRisky2 = await safetyMonitor.monitor("I want to end it all", "user-1", "session-1");
      console.log("Safety Check (Risky):", isRisky2 === true ? "Pass" : "Fail");
  } catch (e) {
      console.error("Safety Monitor Check Failed:", e);
  }

  // 5. Simulate Chapter Generation (SYS-01 AoT)
  console.log("\n[Simulating AoT Chapter Generation - SYS-01]");
  try {
      // Mock transcript
      const transcript = "I was born in 1950. It was a cold winter. My mother always said...";
      const result = await chapterGenerator.generateChapter(transcript, []);
      console.log("Chapter Generated:", result.chapter ? "Yes" : "No");
      console.log("Atoms Extracted:", Object.keys(result.atoms).join(', '));
  } catch (e) {
      console.error("Chapter Generator Check Failed:", e);
  }

  console.log("\n=== Verification Complete ===");
}

main().catch(console.error);
