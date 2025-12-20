export interface SpeechPort {
  textToSpeech(text: string, style?: string): Promise<Buffer>;
  speechToText(audioBuffer: Buffer, contentType: string): Promise<string>;
}
