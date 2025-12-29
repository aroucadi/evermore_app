# Algorithms: Atom of Thought (AoT)

Evermore implements an advanced cognitive architecture called **Atom of Thought (AoT)** to handle complex creative tasks.

## Why AoT?
Large Language Models (LLMs) struggle with "long-horizon" tasks (e.g., "Write a perfect book chapter with consistency"). They forget earlier constraints or hallucinate details.

**AoT** solves this by breaking the task into atomic, parallel sub-tasks ("Atoms") that are verified before synthesis.

---

## 1. Chapter Generation Algorithm (5 Atoms)

Used in: `AoTChapterGeneratorAdapter`

### Inputs
- Raw Conversation Transcript
- Previous 5 Chapter Summaries (for context)

### The Decomposition (Parallel Execution)
1. **Atom 1: Narrative Arc** (`extractNarrativeArc`)
   - *Goal*: Extract the core "truth" or theme of the memory.
2. **Atom 2: Best Quotes** (`selectBestQuotes`)
   - *Goal*: Find specific verbatim phrases that carry emotional weight.
3. **Atom 3: Sensory Details** (`extractSensoryDetails`)
   - *Goal*: List sights, smells, sounds mentioned.
4. **Atom 4: Emotional Valence** (`determineEmotionalValence`)
   - *Goal*: Is this sad? Proud? Nostalgic?
5. **Atom 5: Connections** (`findPreviousChapterConnections`)
   - *Goal*: Link this memory to previous life chapters.

### The Synthesis
A final prompting stage collects all 5 verified atoms and writes the narrative. This forces the LLM to use the *extracted facts* rather than making things up.

---

## 2. Storybook Generation Algorithm (6-Step Pipeline)

Used in: `StorybookService` / `AoTStorybookGenerator`

### The Pipeline
1. **Transformation**: Adult Transcript -> Children's Narrative (Age appropriate filter).
2. **Decomposition (AoT)**:
   - *Key Moments* (Visual scenes to draw)
   - *Visual Elements* (Consistent style guide)
   - *Narrative Beats* (Pacing)
   - *Character Details* (Appearance consistency)
3. **Contraction**: Select exactly 6 best scenes to fit standard booklet format.
4. **Layout Optimization**: AI decides layout (`full-bleed` vs `text-heavy`) based on emotional intensity.
5. **Illustration**: Parallel generation of 6 images using Vertex Imagen 2 + Style Transfer Prompting.
6. **Assembly**: Compile into PDF.

---

## 3. Hallucination Detection Algorithm

A "Observer-Critic" loop runs after generation.

1. **Judge LLM** reads: (A) Original Transcript, (B) Generated Chapter.
2. **Task**: list every statement in (B) not supported by (A).
3. **Scoring**:
   - *High Risk*: Flag for human review.
   - *Low Risk*: Auto-publish.

This ensures we never fabricate details about a senior's life.
