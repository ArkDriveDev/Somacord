import {
  IonContent, IonPage, IonHeader, IonToolbar,
  IonTitle, useIonViewWillEnter, useIonViewWillLeave
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronDownOutline, micOutline, micOffOutline } from 'ionicons/icons';
import './Hologram.css';
import Octavia from '../Assets/Warframes/Octavia.png';
import VoiceService from '../services/VoiceService';
import CommandList from '../services/CommandList';
import hello from '../Assets/Responses/Suda1.wav';
import reverseImage from '../Assets/reverse.png';
import clem from '../Assets/Responses/Clem.wav';
import success from '../Assets/Responses/Launch.wav';
import { fetchAvailableModels } from '../services/ModelsService';
import Musics, { MusicPlayerHandle } from './Musics';
import SudaDefault from '../Assets/Suda/Suda.png';
import SudaResponse from '../Assets/Suda/Suda1.png';


interface HologramModel {
  id: number;
  name: string;
  src: string;
}

const DEFAULT_MODEL: HologramModel = {
  id: 1,
  name: 'Octavia',
  src: Octavia
};

const SUDA_MODEL: HologramModel = {
  id: 2,
  name: 'Suda',
  src: SudaDefault
};

const SUDA_RESPONSE_MODEL: HologramModel = {
  id: 3,
  name: 'SudaResponse',
  src: SudaResponse
};

// Audio cache
const audioCache: Record<string, HTMLAudioElement> = {};

// Preload audio files
const preloadAudio = (name: string, url: string) => {
  const audio = new Audio(url);
  audio.preload = 'auto';
  audio.volume = 0.8;
  audioCache[name] = audio;
};

preloadAudio('hello', hello);
preloadAudio('clem', clem);
preloadAudio('success', success);

const playAudio = (name: string): Promise<void> => {
  return new Promise((resolve) => {
    const src = audioCache[name]?.src;
    if (!src) {
      console.warn(`Audio ${name} not in cache`);
      return resolve();
    }

    const audio = new Audio(src);
    audio.volume = 0.8;

    const finish = () => {
      audio.removeEventListener('ended', finish);
      audio.removeEventListener('error', finish);
      resolve();
    };

    audio.addEventListener('ended', finish);
    audio.addEventListener('error', finish);
    audio.play().catch((err) => {
      console.error(`Playback error for ${name}:`, err);
      resolve(); // fallback
    });
  });
};

const Hologram: React.FC = () => {
  const location = useLocation<{ model?: HologramModel }>();
  const [selectedModel, setSelectedModel] = useState<HologramModel>(DEFAULT_MODEL);
  const [originalModel, setOriginalModel] = useState<HologramModel>(DEFAULT_MODEL);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [isModelChanging, setIsModelChanging] = useState(false);
  const [isPlayingSudaAudio, setIsPlayingSudaAudio] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [isWindows, setIsWindows] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const musicPlayerRef = useRef<MusicPlayerHandle>(null);

  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const modelChangeTimeout = useRef<NodeJS.Timeout | null>(null);
  const [fadeClass, setFadeClass] = useState('');

  const switchModelWithFade = (model: HologramModel) => {
    setFadeClass('fade-out');
    setTimeout(() => {
      setSelectedModel(model);
      setFadeClass('fade-in');
      setTimeout(() => setFadeClass(''), 400); // clear class after animation
    }, 200); // delay fade-out before switching
  };

  // Check if running on Windows
  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    setIsWindows(userAgent.indexOf("Windows") !== -1);
  }, []);

  // Play success sound on Windows when component mounts
  useEffect(() => {
    if (isWindows) {
      const playInitialSound = async () => {
        try {
          // Force Suda static model first
          switchModelWithFade(SUDA_MODEL);
          setIsResponding(true);
          await playAudio('success');
        } catch (e) {
          console.error("Initial sound error:", e);
        } finally {
          setTimeout(() => setIsResponding(false), 2000);
        }
      };
      playInitialSound();
    }
  }, [isWindows]);

  // Handle model switching when responding
  useEffect(() => {
    if (isResponding) {
      if (
        selectedModel.id !== SUDA_MODEL.id &&
        selectedModel.id !== SUDA_RESPONSE_MODEL.id
      ) {
        setOriginalModel(selectedModel);
      }
    } else {
      if (
        selectedModel.id === SUDA_MODEL.id ||
        selectedModel.id === SUDA_RESPONSE_MODEL.id
      ) {
        switchModelWithFade(originalModel);
      }
    }
  }, [isResponding, selectedModel, originalModel]);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
          const target = mutation.target as HTMLElement;
          if (target.id === 'main-content') {
            target.removeAttribute('aria-hidden');
          }
        }
      });
    });

    const mainContent = document.getElementById('main-content');
    if (mainContent) observer.observe(mainContent, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const fromRoute = location.state?.model;
    if (fromRoute) {
      switchModelWithFade(fromRoute);
      setOriginalModel(fromRoute);
      localStorage.setItem('selectedModel', JSON.stringify(fromRoute));
    } else {
      const saved = localStorage.getItem('selectedModel');
      if (saved) {
        const parsed = JSON.parse(saved);
        switchModelWithFade(parsed);
        setOriginalModel(parsed);
      }
    }
  }, [location.state]);

const playHelloSound = async () => {
  try {
    setIsResponding(true);
    setIsPlayingSudaAudio(true);
    switchModelWithFade(SUDA_RESPONSE_MODEL);
    await playAudio('hello'); // fully blocking now
  } catch (e) {
    console.error("Hello sound error:", e);
  } finally {
    setIsResponding(false);
    setIsPlayingSudaAudio(false);
  }
};

  const handleReverseClick = async () => {
    setIsReversed(!isReversed);
    try {
      await playAudio('clem');
    } catch (e) {
      console.error("Clem sound error:", e);
    }
  };

 const toggleMic = async () => {
  if (micEnabled) {
    // 🔇 Stop listening
    VoiceService.stopListening();
    setIsVoiceActive(false);
    setMicEnabled(false);
  } else {
    // ⏸ Pause music if needed
    if (isMusicPlaying) {
      setIsMusicPlaying(false);
      musicPlayerRef.current?.pause();
    }

    try {
      // ✅ 1. First, play audio completely
      await playHelloSound(); // <-- mic is still OFF here

      // ✅ 2. THEN request microphone permission and turn it on
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);

      // ✅ 3. THEN start voice service
      const started = await VoiceService.startListening(handleVoiceCommand);
      if (started) {
        setIsVoiceActive(true);
        setMicEnabled(true);
      }
    } catch (error) {
      console.error("Mic activation error:", error);
      setPermissionGranted(false);
      setIsVoiceActive(false);
      setMicEnabled(false);
    }
  }
};

  const handleModelChange = useCallback(async (modelName: string | HologramModel | null) => {
    if (!modelName) {
      setIsModelChanging(false);
      return;
    }

    try {
      setIsModelChanging(true);
      switchModelWithFade(SUDA_MODEL); // Step 1: show Suda.png right away
      VoiceService.setSystemAudioState(true);

      // Load model info first
      let resolvedModel: HologramModel | null = null;

      if (typeof modelName !== 'string') {
        resolvedModel = modelName;
      } else {
        const models = await fetchAvailableModels();
        const normalizedInput = modelName.toLowerCase().trim();
        resolvedModel = models.find(m =>
          m.name.toLowerCase() === normalizedInput ||
          m.name.toLowerCase().includes(normalizedInput)
        ) || null;
      }

      // Step 2: Play success sound while Suda.png is visible
      await playAudio('success');

      // Step 3: After sound, set actual model
      if (resolvedModel) {
        switchModelWithFade(resolvedModel);
        setOriginalModel(resolvedModel);
        localStorage.setItem('selectedModel', JSON.stringify(resolvedModel));
      }

    } catch (error) {
      console.error("Model change error:", error);
    } finally {
      VoiceService.setSystemAudioState(false);
      setIsModelChanging(false);
    }
  }, []);

  const handleVoiceCommand = useCallback(async (command: string) => {
    try {
      setIsResponding(true);
      clearTimeout(responseTimeoutRef.current as NodeJS.Timeout);

      // Set Suda1 (talking) immediately before processing
      switchModelWithFade(SUDA_RESPONSE_MODEL);

      const result = await CommandList(command);

      if (result.action === 'changeModel' && result.model) {
        await handleModelChange(result.model);
      }

      responseTimeoutRef.current = setTimeout(() => {
        setIsResponding(false);
      }, 2000);
    } catch (error) {
      console.error("Command error:", error);
      setIsResponding(false);
    }
  }, [handleModelChange]);

  useIonViewWillEnter(() => {
    // Blur any focused element
    document.activeElement instanceof HTMLElement && document.activeElement.blur();

    // Always play success sound + show Suda.png
    const playIntro = async () => {
      try {
        switchModelWithFade(SUDA_MODEL);     // Show Suda
        setIsResponding(true);            // Trigger animation/effect
        await playAudio('success');       // Play welcome sound
      } catch (err) {
        console.error("Intro sound error:", err);
      } finally {
        setTimeout(() => setIsResponding(false), 2000); // Reset after delay
      }
    };

    playIntro();
  });

  useIonViewWillLeave(() => {
    VoiceService.stopListening();
    setIsVoiceActive(false);
    setIsResponding(false);
    setIsPlayingSudaAudio(false);
    setMicEnabled(false);
    clearTimeout(responseTimeoutRef.current as NodeJS.Timeout);
    clearTimeout(modelChangeTimeout.current as NodeJS.Timeout);
  });

  return (
    <IonPage style={{ backgroundColor: 'black' }}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{selectedModel.name}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="hologram-container">
        <button
          onClick={toggleMic}
          className={`mic-toggle-button ${micEnabled ? 'active' : ''}`}
          title={micEnabled ? "Turn off microphone" : "Turn on microphone"}
        >
          <IonIcon icon={micEnabled ? micOutline : micOffOutline} />
        </button>

        <div className={`hologram-center ${isResponding &&
          (selectedModel.id === SUDA_MODEL.id || selectedModel.id === SUDA_RESPONSE_MODEL.id)
          ? 'pulse-effect'
          : ''
          }`}>
          <img
            src={reverseImage}
            alt="Reverse Hologram"
            className="center-image"
            onClick={handleReverseClick}
            onError={(e) => console.error("Failed to load center image")}
          />
          <div className={`reflection-base ${isReversed ? 'reversed' : ''}`}>
            {['top', 'right', 'bottom', 'left'].map((position) => (
              <div key={position} className={`reflection-image ${position}`}>
                <div
                  className={`model-image-wrapper ${fadeClass}`} // <-- add fadeClass state
                >
                  <img
                    src={selectedModel.src}
                    alt={`${position} Reflection`}
                    className={selectedModel.name === 'Suda' ? 'suda-glow-animation' : ''}
                    onLoad={() => {
                      if (
                        selectedModel.id === SUDA_MODEL.id ||
                        selectedModel.id === SUDA_RESPONSE_MODEL.id
                      ) {
                        setIsPlayingSudaAudio(true);
                      } else {
                        setIsPlayingSudaAudio(false);
                      }
                    }}
                    onError={(e) => (e.currentTarget.src = DEFAULT_MODEL.src)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </IonContent>

      <div
        className={`music-player-container ${showMusicPlayer ? 'music-player-visible' : 'music-player-hidden'}`}
      >
        <button
          onClick={() => setShowMusicPlayer(false)}
          className="music-player-toggle-close"
          title="Hide Music Player"
        >
          <IonIcon icon={chevronDownOutline} />
        </button>
        <Musics
          ref={musicPlayerRef}
          isMicActive={micEnabled}
          onPlayStateChange={setIsMusicPlaying}
          onPlayRequest={() => {
            if (micEnabled) {
              toggleMic(); // Turn off mic if music starts playing
            }
          }}
        />
      </div>

      {!showMusicPlayer && (
        <button
          onClick={() => setShowMusicPlayer(true)}
          className="music-player-toggle-open"
          title="Show Music Player"
        >
          <IonIcon icon={chevronDownOutline} style={{ transform: 'rotate(180deg)' }} />
        </button>
      )}
    </IonPage>
  );
};

export default Hologram;