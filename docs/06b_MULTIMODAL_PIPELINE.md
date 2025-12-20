# 06b. Multimodal Pipeline & Signal Processing

## 4.1 Audio Pipeline (The "Ear")

Capturing clean audio from seniors (who often speak quietly, pause frequently, or have background TV noise) is the critical first step.

### **Pipeline Architecture**
`[Mic] -> [Web Audio API Graph] -> [Worklet (VAD)] -> [MediaRecorder] -> [Blob]`

### **Input Capture & Processing**
Implemented in `lib/audio/AudioPipeline.ts`.

1.  **High-Pass Filter (80Hz):** Removes low-frequency rumble (HVAC, table bumps).
2.  **Dynamics Compression:**
    -   *Threshold:* -24dB (Boosts quiet whispers).
    -   *Ratio:* 12:1 (Clamps loud coughs/laughs).
    -   *Attack:* 0.003s (Fast response).
3.  **Voice Activity Detection (VAD):**
    -   **Algorithm:** Custom AudioWorklet (`audio-processor.js`).
    -   **Logic:** Calculates RMS (Root Mean Square) energy of 128-sample frames.
    -   **Adaptive Noise Floor:** Dynamically adjusts threshold based on ambient background noise.
    -   **Debounce:** Requires 300ms of silence to trigger `SPEECH_END` to prevent cutting off seniors mid-sentence.

### **Buffering Strategy**
-   **Pre-Roll Buffer:** We continually buffer the last 500ms of audio even when VAD says "Silence".
-   **Trigger:** When VAD says "Speech Start", we prepend the Pre-Roll buffer to the Active buffer.
-   **Why:** Captures the initial "breath" or weak consonant (e.g., "F" in "Family") that often gets clipped by standard VADs.

---

## 4.2 Speech Normalization (The "Brain Stem")

Raw transcripts are often messy ("Um, well, I... I went to the store.").
Implemented in `lib/core/application/services/SpeechNormalizer.ts`.

1.  **Disfluency Removal:** Regex-based stripping of "um", "uh", "er".
2.  **Repetition Collapse:** "I went I went to" -> "I went to".
3.  **Confidence Check:** If STT confidence < 0.6, we tag the segment as `[UNINTELLIGIBLE]` rather than hallucinating a word.

---

## 4.3 Vision Pipeline (The "Eye")

### **Proustian Trigger (Image Analysis)**
1.  **Input:** User uploads JPEG/PNG.
2.  **Resize:** Client-side resize to max 1024x1024 to save bandwidth/latency.
3.  **Model:** Gemini 1.5 Pro Vision.
4.  **Prompt Engineering:**
    -   *Bad:* "What is in this image?" -> "A woman holding a baby."
    -   *Good:* "Analyze this image for emotional anchors. Identify the 'Punctum'—the detail that pricks the viewer. Generate a conversational opening question." -> "I see a woman holding a baby, but I notice the locket she's wearing. Is that a family heirloom?"

---

## 4.4 Error Handling & degradation

| Failure Mode | Detection | Fallback |
| :--- | :--- | :--- |
| **Mic Permission Denied** | `navigator.mediaDevices` throws | UI shows "Unlock Mic" tutorial. |
| **VAD False Positive** | Audio < 0.5s duration | Discard silent blob. |
| **STT Failure** | API 500 or Empty Text | Ask User: "I didn't catch that." |
| **Slow Network** | Buffer > 5MB | Stop recording, force upload. |
