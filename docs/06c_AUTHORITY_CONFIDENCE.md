# 06c. Authority & Confidence Guidelines (A1/A3 Hardening)

## 6.5 Authority Hierarchy (A1 Hardening)

**Problem:** When memory conflicts with user correction or chapters conflict with each other, who is authoritative?

**Authority Order (Highest to Lowest):**

1.  **User Correction** - If a user explicitly corrects a fact, this supersedes all other sources.
2.  **Recent Session** - More recent sessions are more authoritative than older ones.
3.  **High-Confidence Memory** - Memories with `correctnessConfidence > 0.8` and `decayFactor > 0.5`.
4.  **Low-Confidence Memory** - Memories that match the query but have lower confidence.
5.  **Inferred Facts** - Facts inferred by the AI without direct user statement.

**Resolution Logic:**

When a conflict is detected:
1. Check if user has explicitly corrected the fact
2. If yes, mark old memory using `supersededBy` field (implemented in `AgentMemory.ts`)
3. Reduce `correctnessConfidence` on superseded memory to 0.2
4. Prefer the correction in all future retrievals

**Code Reference:** `MemoryEntry.supersededBy` and `MemoryEntry.correctnessConfidence` in `lib/core/application/agent/memory/AgentMemory.ts`

---

## 6.6 Confidence Signaling (A3 Hardening)

**Problem:** The agent should communicate uncertainty to users, especially seniors.

**Signal Guidelines:**

| Memory Decay Factor | Phrase Template |
| :--- | :--- |
| `> 0.8` | "You mentioned that..." |
| `0.5 - 0.8` | "I believe you said..." |
| `0.3 - 0.5` | "If I remember correctly..." |
| `< 0.3` | "I'm not sure, but I think..." |
| No memory found | "I don't recall us discussing that." |

**Rules:**
-   Never assert with full confidence for memories with `decayFactor < 0.5`.
-   Always allow immediate correction: "Did I get that right?"
-   Log correction events for system improvement.

---

## What the System Does NOT Guarantee (D3 Hardening)

To prevent future overreach, we explicitly state:

| Non-Guarantee | Reason | Mitigation |
|---------------|--------|------------|
| Cross-chapter factual consistency | Computational cost | Manual family review |
| Emotional tone preservation through transformation | Creative latitude | S1 hardening: explicit tone tagging |
| Memory correctness re-evaluation | No ground truth oracle | User correction path |
| Infinite memory retention | Storage/compute cost | Configurable archival |
| Perfect STT transcription | Audio quality dependent | `[UNINTELLIGIBLE]` tagging |

This clarity prevents future engineers from assuming these guarantees exist.
