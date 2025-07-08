// src/services/VoiceService.ts
declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
    webkitAudioContext: typeof AudioContext;
  }
}

type RecognitionState = 'inactive' | 'running' | 'paused';

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private isSpeaking = false;
  private systemAudioPlaying = false;
  private onResultCallback: ((command: string) => void) | null = null;
  private cooldownTimeout: number | null = null;
  private readonly COOLDOWN_MS = 1500;
  private audioContext: AudioContext | null = null;
  private restartAttempts = 0;
  private readonly MAX_RESTART_ATTEMPTS = 3;
  private isRestarting = false;

  // New model selection state
  private isExpectingModel = false;
  private modelChangeCallback: ((modelName: string) => void) | null = null;
  private modelTimeout: number | null = null;

  constructor() {
    this.initRecognition();
    this.initAudioContext();
  }

  private initAudioContext(): void {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    } catch (e) {
      console.warn("AudioContext not supported:", e);
    }
  }

  private initRecognition(): void {
    const SpeechRecog = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecog) {
      console.error("Speech Recognition not supported");
      return;
    }

    this.recognition = new SpeechRecog();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";
    this.recognition.maxAlternatives = 1;

    this.recognition.onaudiostart = () => {
      this.applyAudioConstraints();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (this.shouldIgnoreInput()) return;
      const results = event.results[event.results.length - 1];
      if (results.isFinal) {
        const transcript = results[0].transcript.trim();
        console.log("Voice command detected:", transcript);

        if (this.isExpectingModel) {
          this.modelChangeCallback?.(transcript);
          this.cancelModelSelection();
        } else {
          this.onResultCallback?.(transcript);
        }
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const ignorableErrors = ['no-speech', 'audio-capture'];
      if (!ignorableErrors.includes(event.error)) {
        console.error("Recognition error:", event.error);
      }
      this.safeRestart();
    };

    this.recognition.onend = () => {
      if (this.isListening && !this.shouldIgnoreInput() && !this.isRestarting) {
        this.safeRestart();
      }
    };
  }

  private applyAudioConstraints(): void {
    try {
      const stream = (this.recognition as any).stream;
      if (stream) {
        const tracks = stream.getAudioTracks();
        tracks.forEach((track: MediaStreamTrack) => {
          track.applyConstraints({
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }).catch((e: Error) => console.warn("Audio constraints error:", e));
        });
      }
    } catch (e) {
      console.warn("Audio constraints failed:", e);
    }
  }

  private shouldIgnoreInput(): boolean {
    return this.isSpeaking || this.systemAudioPlaying;
  }

  private getRecognitionState(): RecognitionState {
    if (!this.recognition) return 'inactive';
    return (this.recognition as any).state || 'inactive';
  }

  private async safeRestart(): Promise<void> {
    if (this.isRestarting) return;
    this.isRestarting = true;

    try {
      if (!this.recognition || !this.isListening || this.shouldIgnoreInput()) {
        return;
      }

      // More thorough state checking
      const currentState = this.getRecognitionState();
      if (currentState === 'running') {
        return;
      }

      // Ensure clean stop before restart
      if (currentState !== 'inactive') {
        try {
          this.recognition.stop();
          await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay
        } catch (stopError) {
          console.warn("Error stopping recognition:", stopError);
        }
      }

      // Additional check before starting
      if (this.isListening && !this.shouldIgnoreInput() && this.getRecognitionState() === 'inactive') {
        try {
          this.recognition.start();
          this.restartAttempts = 0;
          console.debug("Recognition restarted successfully");
        } catch (startError) {
          if (startError instanceof DOMException && startError.name === 'InvalidStateError') {
            console.debug("Recognition already running, ignoring restart");
            return;
          }
          throw startError;
        }
      }
    } catch (error) {
      console.warn("Restart attempt failed:", error);
      this.restartAttempts++;

      if (this.restartAttempts <= this.MAX_RESTART_ATTEMPTS) {
        const delay = Math.min(1000 * this.restartAttempts, 5000);
        setTimeout(() => this.safeRestart(), delay);
      } else {
        console.error("Max restart attempts reached. Stopping...");
        this.stopListening();
      }
    } finally {
      this.isRestarting = false;
    }
  }
  // MODEL SELECTION METHODS
  public startModelSelection(timeoutMs: number, callback: (modelName: string) => void): void {
    this.isExpectingModel = true;
    this.modelChangeCallback = callback;
    this.modelTimeout = window.setTimeout(() => {
      this.cancelModelSelection();
      callback(''); // Empty string indicates timeout
    }, timeoutMs);
  }

  public cancelModelSelection(): void {
    if (this.modelTimeout) {
      clearTimeout(this.modelTimeout);
      this.modelTimeout = null;
    }
    this.isExpectingModel = false;
    this.modelChangeCallback = null;
  }

  public isExpectingModelSelection(): boolean {
    return this.isExpectingModel;
  }

  // EXISTING VOICE SERVICE METHODS
  public async startListening(onResult: (command: string) => void): Promise<boolean> {
    if (!this.recognition) return false;

    this.onResultCallback = onResult;
    this.isListening = true;
    this.restartAttempts = 0;

    try {
      await this.safeRestart();
      return true;
    } catch (error) {
      console.error("Failed to start listening:", error);
      return false;
    }
  }

  public stopListening(): void {
    this.isListening = false;
    this.onResultCallback = null;
    this.restartAttempts = 0;
    this.cancelModelSelection();

    if (this.cooldownTimeout) {
      clearTimeout(this.cooldownTimeout);
      this.cooldownTimeout = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.warn("Error while stopping recognition:", error);
      }
    }
  }

  public setSpeakingState(speaking: boolean): void {
    if (this.isSpeaking === speaking) return;
    this.isSpeaking = speaking;
    this.handleAudioStateChange();
  }

  public setSystemAudioState(playing: boolean): void {
    if (this.systemAudioPlaying === playing) return;
    this.systemAudioPlaying = playing;
    this.handleAudioStateChange();
  }

  private handleAudioStateChange(): void {
    if (this.shouldIgnoreInput()) {
      if (this.cooldownTimeout) {
        clearTimeout(this.cooldownTimeout);
        this.cooldownTimeout = null;
      }
      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch (error) {
          console.warn("Error stopping recognition:", error);
        }
      }
      if (this.isExpectingModel) {
        this.cancelModelSelection();
      }
    } else if (this.isListening) {
      if (this.cooldownTimeout) {
        clearTimeout(this.cooldownTimeout);
      }
      this.cooldownTimeout = window.setTimeout(() => {
        if (this.isListening && !this.shouldIgnoreInput()) {
          this.safeRestart();
        }
      }, this.COOLDOWN_MS);
    }
  }

  public getState() {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      systemAudioPlaying: this.systemAudioPlaying,
      recognitionActive: this.getRecognitionState(),
      expectingModel: this.isExpectingModel
    };
  }
}

export default new VoiceService();