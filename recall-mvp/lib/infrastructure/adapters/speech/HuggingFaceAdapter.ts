import { SpeechPort } from '../../../core/application/ports/SpeechPort';

export class HuggingFaceAdapter implements SpeechPort {
    private apiKey: string;
    private ttsModel: string;
    private sttModel: string;

    constructor() {
        this.apiKey = process.env.HUGGINGFACE_API_KEY || '';
        this.ttsModel = process.env.HF_TTS_MODEL || 'facebook/mms-tts-eng'; // or espnet/kan-bayashi_ljspeech_vits
        this.sttModel = process.env.HF_STT_MODEL || 'openai/whisper-tiny.en';
    }

    async textToSpeech(text: string, style?: string): Promise<Buffer> {
        if (!this.apiKey) {
             console.warn("No HuggingFace API Key, returning mock audio");
             return Buffer.from("mock-audio-hf");
        }

        const response = await fetch(`https://api-inference.huggingface.co/models/${this.ttsModel}`, {
            headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ inputs: text }),
        });

        if (!response.ok) {
            throw new Error(`HF TTS failed: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    async speechToText(audioBuffer: Buffer, contentType: string): Promise<string> {
        if (!this.apiKey) {
            return "Mock transcription from HuggingFace";
        }

        const response = await fetch(`https://api-inference.huggingface.co/models/${this.sttModel}`, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": contentType || "audio/wav"
            },
            method: "POST",
            body: audioBuffer as any, // Cast to any to satisfy fetch types with Node Buffer
        });

        if (!response.ok) {
            throw new Error(`HF STT failed: ${response.statusText}`);
        }

        const result = await response.json();
        return result.text || "";
    }
}
