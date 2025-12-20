export interface SpeechToTextResult {
    text: string;
    confidence: number;
    normalizedText: string;
}

export interface SpeechPort {
  textToSpeech(text: string, style?: string): Promise<Buffer>;
  speechToText(audioBuffer: Buffer, contentType: string): Promise<SpeechToTextResult>;
}
