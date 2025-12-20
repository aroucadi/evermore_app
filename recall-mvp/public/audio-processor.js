class VoiceActivityDetector extends AudioWorkletProcessor {
  constructor() {
    super();
    this._volume = 0;

    // VAD Parameters
    this._sampleRate = 16000; // Will be updated by global scope if available, or assumed
    this._minEnergy = 0.001;
    this._vadThreshold = 0.01; // Base threshold, will be adaptive
    this._noiseEnergy = 0.001; // Estimated noise floor
    this._alpha = 0.95; // Smoothing factor
    this._hangoverFrames = 50; // How many frames to keep active after speech drops
    this._hangoverCounter = 0;
    this._isSpeaking = false;

    // Adaptive Noise Floor
    this._noiseFrames = 0;
    this._noiseAccumulator = 0;

    // Message throttling
    this._lastMessageTime = currentTime;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input.length) return true;

    const channelData = input[0];
    const frameSize = channelData.length;

    // 1. Calculate RMS of this frame
    let sumSquares = 0;
    for (let i = 0; i < frameSize; i++) {
      sumSquares += channelData[i] * channelData[i];
    }
    const rms = Math.sqrt(sumSquares / frameSize);

    // 2. Smooth volume for UI
    this._volume = this._volume * 0.8 + rms * 0.2;

    // 3. Adaptive Noise Floor Estimation
    // If signal is low, we assume it's noise and update our noise floor estimate
    if (rms < this._vadThreshold) {
        this._noiseEnergy = this._noiseEnergy * 0.995 + rms * 0.005;
    }

    // Dynamic Threshold: 10dB above noise floor (approx 3x amplitude)
    // Clamp threshold to reasonable bounds
    const dynamicThreshold = Math.max(this._minEnergy, this._noiseEnergy * 3.0);

    // 4. VAD Logic
    const isCurrentlyActive = rms > dynamicThreshold;

    if (isCurrentlyActive) {
        this._hangoverCounter = this._hangoverFrames; // Reset hangover
    } else if (this._hangoverCounter > 0) {
        this._hangoverCounter--;
    }

    const isSpeakingState = this._hangoverCounter > 0;

    // 5. State Change Detection
    if (isSpeakingState && !this._isSpeaking) {
        this._isSpeaking = true;
        this.port.postMessage({ type: 'SPEECH_START' });
    } else if (!isSpeakingState && this._isSpeaking) {
        this._isSpeaking = false;
        this.port.postMessage({ type: 'SPEECH_END' });
    }

    // 6. Periodic Updates (every ~100ms)
    if (currentTime - this._lastMessageTime > 0.1) {
        this.port.postMessage({
            type: 'VOLUME',
            volume: this._volume,
            threshold: dynamicThreshold,
            isSpeaking: this._isSpeaking
        });
        this._lastMessageTime = currentTime;
    }

    return true; // Keep processor alive
  }
}

registerProcessor('voice-activity-detector', VoiceActivityDetector);
