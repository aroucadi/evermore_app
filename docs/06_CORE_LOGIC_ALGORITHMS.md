# 06. Core Logic & Algorithms

## 6.1 The "Director" Pattern (Voice Orchestration)

The "Director" (`SessionGoalArchitect`) is the logic that governs the AI's behavior during a voice session. It prevents the AI from being a passive listener.

**Algorithm:**
1.  **Input:** User Audio -> STT -> Text.
2.  **Context Assembly:**
    -   Fetch last 10 turns of conversation (Short Term).
    -   Fetch related memories from Vector Store (RAG) (Long Term).
    -   Fetch current "Session Goal" (e.g., "Explore Childhood").
3.  **Strategy Selection (Chain-of-Thought):**
    -   *Input:* "I miss my dog."
    -   *Thought:* "User is expressing sadness. Goal is 'Childhood', but I should validate emotion first."
    -   *Strategy:* `Validate` + `Pivot`.
4.  **Response Generation:**
    -   Generate text based on Strategy.
    -   Inject `[emotion]` tags for TTS.
5.  **Execution:** Send to TTS.

---

## 6.2 Atom of Thoughts (AoT) Chapter Generation

We use a decomposition-synthesis approach to generate high-quality biographies, implemented in `AoTChapterGeneratorAdapter`.

### **Pseudocode**

```typescript
function generateChapter(transcript: string): Chapter {
  // Phase 1: Decomposition (Run in Parallel)
  const atoms = await Promise.all([
    extractNarrativeArc(transcript), // "The Hero's Journey"
    extractQuotes(transcript),       // Verbatim powerful text
    extractSensoryDetails(transcript), // Smells, sights
    extractFacts(transcript)         // Dates, Locations
  ]);

  // Phase 2: Validation
  if (!atoms.narrativeArc.isCoherent) {
    throw new Error("Transcript too sparse");
  }

  // Phase 3: Synthesis
  const chapterDraft = await synthesizeChapter({
    inputs: atoms,
    tone: "Nostalgic but grounded",
    style: "Hemingway-esque"
  });

  // Phase 4: Formatting
  return formatMarkdown(chapterDraft);
}
```

**Edge Cases:**
-   *Transcript too short (< 50 words):* Reject generation. Return "Draft" status.
-   *Contradictory Facts:* The "Fact Agent" flags specific contradictions (e.g., "Born in 1950" vs "10 years old in 1945") for human review.

---

## 6.3 Scheduling Algorithm (Timezones)

**Problem:** Senior is in London (GMT), Family is in New York (EST).
**Logic:** `InvitationScheduler.ts`.

1.  **Storage:** All times stored in UTC.
2.  **Display:**
    -   Senior UI: `Intl.DateTimeFormat(..., { timeZone: 'Europe/London' })`.
    -   Family UI: `Intl.DateTimeFormat(..., { timeZone: 'America/New_York' })`.
3.  **Conflict Detection:**
    -   Check overlapping intervals `[start, end)` in DB.
    -   *Invariant:* A senior cannot have two sessions active simultaneously.

---

## 6.4 Safety Guard Algorithm

**Logic:** `ContentSafetyGuard.ts`.

1.  **Tier 1: Regex (Sync, < 1ms)**
    -   Pattern: `/\b(kill myself|suicide|die now)\b/i`
    -   Action: Immediate block.
2.  **Tier 2: LLM Classification (Async, ~500ms)**
    -   Prompt: "Analyze text for: Self-Harm, Abuse, Dementia-confusion. Output Severity Score 0-10."
    -   Action:
        -   Score > 8: Trigger P0 Alert (SMS to Family).
        -   Score > 5: Trigger P1 Alert (Email to Family).
        -   Score < 5: Log only.
