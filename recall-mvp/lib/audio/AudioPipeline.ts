export class AudioPipeline {
    private audioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private workletNode: AudioWorkletNode | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private sourceNode: MediaStreamAudioSourceNode | null = null;
    private filterNode: BiquadFilterNode | null = null;
    private compressorNode: DynamicsCompressorNode | null = null;
    private destinationNode: MediaStreamAudioDestinationNode | null = null;

    private isRecording = false;
    private isSpeaking = false;

    // Chunk Management
    private preRollBuffer: Blob[] = [];
    private activeBuffer: Blob[] = [];
    private readonly MAX_PREROLL_CHUNKS = 5; // ~500ms at 100ms chunks

    // Event Callbacks
    public onVolumeChange: ((volume: number) => void) | null = null;
    public onSpeechStart: (() => void) | null = null;
    public onSpeechEnd: ((audioBlob: Blob) => void) | null = null;
    public onError: ((error: Error) => void) | null = null;

    constructor() {
        console.log("AudioPipeline: Constructor");
        if (typeof window !== 'undefined' && !window.AudioContext) {
            console.error("Web Audio API not supported");
        }
    }

    public async initialize() {
        console.log("AudioPipeline: Initializing...");
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 16000,
            });
            console.log("AudioPipeline: Context created state=", this.audioContext.state);

            // Load Worklet
            try {
                console.log("AudioPipeline: Adding module...");
                const addModulePromise = this.audioContext.audioWorklet.addModule('/audio-processor.js');
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout adding audio worklet module")), 2000)
                );
                await Promise.race([addModulePromise, timeoutPromise]);
                console.log("AudioPipeline: Module added.");
            } catch (e) {
                console.error("Failed to load audio worklet. Fallback logic needed?", e);
                // Proceed without worklet (VAD will not work, but basic recording might if we skip worklet node connection)
            }

            // Get User Media
            console.log("AudioPipeline: Requesting User Media...");
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false,
                }
            });
            console.log("AudioPipeline: Stream acquired.");

            // Build Graph
            this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

            this.filterNode = this.audioContext.createBiquadFilter();
            this.filterNode.type = 'highpass';
            this.filterNode.frequency.value = 80;

            this.compressorNode = this.audioContext.createDynamicsCompressor();
            this.compressorNode.threshold.value = -24;
            this.compressorNode.knee.value = 30;
            this.compressorNode.ratio.value = 12;
            this.compressorNode.attack.value = 0.003;
            this.compressorNode.release.value = 0.25;

            try {
                this.workletNode = new AudioWorkletNode(this.audioContext, 'voice-activity-detector');
                this.workletNode.port.onmessage = (event) => this.handleWorkletMessage(event.data);

                this.destinationNode = this.audioContext.createMediaStreamDestination();

                this.sourceNode.connect(this.filterNode);
                this.filterNode.connect(this.compressorNode);
                this.compressorNode.connect(this.destinationNode);
                this.filterNode.connect(this.workletNode);
                console.log("AudioPipeline: Graph connected.");
            } catch (e) {
                console.error("AudioPipeline: Graph connection failed", e);
            }

            this.setupMediaRecorder();

        } catch (err) {
            console.error("AudioPipeline Initialization Error:", err);
            if (this.onError) this.onError(err instanceof Error ? err : new Error(String(err)));
        }
    }

    private setupMediaRecorder() {
        if (!this.destinationNode) return;

        const mimeType = MediaRecorder.isTypeSupported('audio/webm; codecs=opus')
            ? 'audio/webm; codecs=opus'
            : 'audio/webm';

        console.log("AudioPipeline: Setup MediaRecorder with", mimeType);

        this.mediaRecorder = new MediaRecorder(this.destinationNode.stream, {
            mimeType,
            audioBitsPerSecond: 24000
        });

        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                this.handleChunk(e.data);
            }
        };

        this.mediaRecorder.start(100);
    }

    private handleChunk(chunk: Blob) {
        if (this.isSpeaking) {
            this.activeBuffer.push(chunk);
        } else {
            this.preRollBuffer.push(chunk);
            if (this.preRollBuffer.length > this.MAX_PREROLL_CHUNKS) {
                this.preRollBuffer.shift();
            }
        }
    }

    private handleWorkletMessage(data: any) {
        switch (data.type) {
            case 'VOLUME':
                if (this.onVolumeChange) this.onVolumeChange(data.volume);
                break;
            case 'SPEECH_START':
                console.log("AudioPipeline: SPEECH_START");
                this.isSpeaking = true;
                this.activeBuffer = [...this.preRollBuffer];
                this.preRollBuffer = [];
                if (this.onSpeechStart) this.onSpeechStart();
                break;
            case 'SPEECH_END':
                console.log("AudioPipeline: SPEECH_END");
                this.isSpeaking = false;
                this.finalizeSegment();
                break;
        }
    }

    private finalizeSegment() {
        if (this.activeBuffer.length === 0) return;
        const blob = new Blob(this.activeBuffer, { type: 'audio/webm; codecs=opus' });
        this.activeBuffer = [];
        if (this.onSpeechEnd) this.onSpeechEnd(blob);
    }

    public async start() {
        console.log("AudioPipeline: Starting...");
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            console.log("AudioPipeline: Context resumed.");
        }
        this.isRecording = true;
    }

    public stop() {
        console.log("AudioPipeline: Stopping...");
        this.isRecording = false;
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}
