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
import SudaResponse from '../Assets/Suda/suda.gif';
import micimage from '../Assets/Suda/Suda1.png';
import floating from '../Assets/Tone.png';

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
      resolve();
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
  const [currentModel, setCurrentModel] = useState<HologramModel | null>(null);

  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const modelChangeTimeout = useRef<NodeJS.Timeout | null>(null);
  const [fadeClass, setFadeClass] = useState('');
  const [initialFade, setInitialFade] = useState('fade-in-initial');

  // Initialize model from route or localStorage
  useEffect(() => {
    const initializeModel = () => {
      // First priority: model from route state (direct navigation)
      if (location.state?.model) {
        const model = location.state.model;
        setSelectedModel(model);
        setOriginalModel(model);
        localStorage.setItem('selectedModel', JSON.stringify(model));
        return;
      }

      // Second priority: model from localStorage
      const savedModel = localStorage.getItem('selectedModel');
      if (savedModel) {
        try {
          const model = JSON.parse(savedModel);
          setSelectedModel(model);
          setOriginalModel(model);
          return;
        } catch (e) {
          console.error('Failed to parse saved model', e);
        }
      }

      // Fallback to default model
      setSelectedModel(DEFAULT_MODEL);
      setOriginalModel(DEFAULT_MODEL);
    };

    initializeModel();
  }, [location.state]);

  const switchModelWithFade = useCallback((model: HologramModel) => {
    // Clear any pending timeouts
    if (modelChangeTimeout.current) {
      clearTimeout(modelChangeTimeout.current);
    }

    // Start fade out animation
    setFadeClass('fade-out');

    // After fade out completes, change model and fade in
    modelChangeTimeout.current = setTimeout(() => {
      setSelectedModel(model);
      setFadeClass('fade-in');

      // After fade in completes, remove animation classes
      modelChangeTimeout.current = setTimeout(() => {
        setFadeClass('');
        modelChangeTimeout.current = null;
      }, 400);
    }, 200);
  }, []);

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
  }, [isWindows, switchModelWithFade]);

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
  }, [isResponding, selectedModel, originalModel, switchModelWithFade]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (modelChangeTimeout.current) {
        clearTimeout(modelChangeTimeout.current);
      }
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }
    };
  }, []);

  const toggleMic = async () => {
    const newMicState = !micEnabled;
    setMicEnabled(newMicState);

    if (!newMicState) {
      VoiceService.stopListening();
      setIsVoiceActive(false);
      return;
    }

    try {
      if (isMusicPlaying) {
        musicPlayerRef.current?.pause();
        setIsMusicPlaying(false);
      }

      setIsResponding(true);
      switchModelWithFade(SUDA_RESPONSE_MODEL);

      await new Promise<void>(resolve => {
        const audio = new Audio(hello);
        audio.onended = () => {
          setIsResponding(false);
          resolve();
        };
        audio.onerror = () => {
          setIsResponding(false);
          resolve();
        };
        audio.play().catch(() => resolve());
      });

      if (newMicState) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());

        const started = await VoiceService.startListening(handleVoiceCommand);
        setIsVoiceActive(started);

        if (!started) setMicEnabled(false);
      }
    } catch (error) {
      console.error("Mic error:", error);
      setMicEnabled(false);
      setIsResponding(false);
    }
  };

  const handleModelChange = useCallback(async (modelName: string | HologramModel | null) => {
    if (!modelName) {
      setIsModelChanging(false);
      return;
    }

    try {
      setIsModelChanging(true);
      switchModelWithFade(SUDA_MODEL);
      VoiceService.setSystemAudioState(true);

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

      await playAudio('success');

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
  }, [switchModelWithFade]);

  const handleVoiceCommand = useCallback(async (command: string) => {
    try {
      setIsResponding(true);
      clearTimeout(responseTimeoutRef.current as NodeJS.Timeout);

      switchModelWithFade(SUDA_RESPONSE_MODEL);

      const result = await CommandList(command);

      if (result.action === 'changeModel' && result.model) {
        await handleModelChange(result.model);
      }
      else if (result.action === 'playMusic') {
        if (micEnabled) {
          toggleMic();
          await new Promise(resolve => setTimeout(resolve, 600));
        }

        if (result.musicId) {
          musicPlayerRef.current?.playTrack?.(result.musicId);
        } else if (result.musicTitle) {
          musicPlayerRef.current?.searchTrack?.(result.musicTitle);
        }

        if (result.shouldResetModel) {
          setTimeout(() => setIsResponding(false), 2000);
        }
      }
      else {
        if (result.shouldResetModel) {
          setTimeout(() => setIsResponding(false), 2000);
        }
      }

    } catch (error) {
      console.error("Command error:", error);
      setIsResponding(false);
    }
  }, [handleModelChange, micEnabled, toggleMic, switchModelWithFade]);

  useIonViewWillEnter(() => {
    document.activeElement instanceof HTMLElement && document.activeElement.blur();

    const playIntro = async () => {
      try {
        switchModelWithFade(SUDA_MODEL);
        setIsResponding(true);
        await playAudio('success');
      } catch (err) {
        console.error("Intro sound error:", err);
      } finally {
        setTimeout(() => setIsResponding(false), 2000);
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

  const handleReverseClick = async () => {
    setIsReversed(!isReversed);
    try {
      await playAudio('clem');
    } catch (e) {
      console.error("Clem sound error:", e);
    }
  };

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
          <img src={micimage} alt="Mic Toggle" />
        </button>

        <div className={`hologram-center ${isResponding &&
          (selectedModel.id === SUDA_MODEL.id || selectedModel.id === SUDA_RESPONSE_MODEL.id)
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
                <div className={`model-image-wrapper ${fadeClass}`}>
                  <img
                    src={selectedModel.src}
                    alt={`${position} Reflection`}
                    className={`
                      ${selectedModel.name === 'Suda' ? 'suda-glow-animation suda-spin' : ''}
                    `}
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
              toggleMic();
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
          <img src={floating} alt="Open Music Player" style={{ width: '40px', height: '40px' }} />
        </button>
      )}
    </IonPage>
  );
};

export default Hologram;