type RecognitionHandler = (transcript: string) => void;

class VoiceService {
  private static instance: VoiceService;
  private recognition: SpeechRecognition | null = null;
  private isSystemAudioPlaying = false;
  private modelSelectionHandler: RecognitionHandler | null = null;
  private modelSelectionTimeout: number | null = null;
  private continuousHandler: RecognitionHandler | null = null;
  private isContinuousListening = false;

  private constructor() {
    this.initializeRecognition();
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  private initializeRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not available');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
      if (this.isSystemAudioPlaying) return;

      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      
      if (this.modelSelectionHandler) {
        this.modelSelectionHandler(transcript);
        this.cleanupModelSelection();
      } else if (this.continuousHandler) {
        this.continuousHandler(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        this.cleanupModelSelection();
      }
    };

    this.recognition.onend = () => {
      if (this.isContinuousListening && !this.isSystemAudioPlaying) {
        this.startContinuousListening();
      }
    };
  }

  public async startListening(handler: RecognitionHandler): Promise<boolean> {
    if (!this.recognition) {
      console.error('Speech recognition not available');
      return false;
    }

    try {
      this.stopListening();
      this.continuousHandler = handler;
      this.isContinuousListening = true;
      await this.startContinuousListening();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      return false;
    }
  }

  private startContinuousListening(): void {
    if (!this.recognition) return;
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error restarting recognition:', error);
      // Attempt to restart after a delay if failed
      setTimeout(() => this.startContinuousListening(), 1000);
    }
  }

  public stopListening(): void {
    this.isContinuousListening = false;
    this.continuousHandler = null;
    this.cleanupModelSelection();
    
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  }

  public startModelSelection(timeoutMs: number, handler: RecognitionHandler): void {
    if (!this.recognition) {
      handler('');
      return;
    }

    this.modelSelectionHandler = handler;
    this.modelSelectionTimeout = window.setTimeout(() => {
      this.cleanupModelSelection();
      handler('');
    }, timeoutMs);

    // Restart recognition to ensure it's active for model selection
    this.recognition.stop();
    setTimeout(() => {
      if (this.recognition && this.modelSelectionHandler) {
        this.recognition.start();
      }
    }, 300);
  }

  private cleanupModelSelection(): void {
    if (this.modelSelectionTimeout) {
      clearTimeout(this.modelSelectionTimeout);
      this.modelSelectionTimeout = null;
    }
    this.modelSelectionHandler = null;
  }

  public setSystemAudioState(isPlaying: boolean): void {
    this.isSystemAudioPlaying = isPlaying;
    
    if (!this.recognition) return;

    if (isPlaying) {
      // Pause recognition during audio playback
      this.recognition.stop();
    } else {
      // Resume recognition after audio ends
      if (this.isContinuousListening || this.modelSelectionHandler) {
        setTimeout(() => {
          if (this.recognition) {
            this.recognition.start();
          }
        }, 300);
      }
    }
  }

  public isAvailable(): boolean {
    return !!this.recognition;
  }
}

// Singleton instance
export default VoiceService.getInstance();