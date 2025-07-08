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
import Musics from './Musics';
import Suda from '../Assets/Suda/Suda.png';

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
  src: Suda
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

const playAudio = async (name: string): Promise<void> => {
  try {
    const audio = audioCache[name].cloneNode(true) as HTMLAudioElement;
    await audio.play();
    await new Promise<void>((resolve) => {
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
    });
  } catch (err) {
    console.error(`Audio playback error (${name}):`, err);
  }
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
  const [showMusicPlayer, setShowMusicPlayer] = useState(true);

  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const modelChangeTimeout = useRef<NodeJS.Timeout | null>(null);

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
      if (selectedModel.id !== SUDA_MODEL.id) {
        setOriginalModel(selectedModel);
      }
      setSelectedModel(SUDA_MODEL);
    } else {
      if (selectedModel.id === SUDA_MODEL.id) {
        setSelectedModel(originalModel);
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
      setSelectedModel(fromRoute);
      setOriginalModel(fromRoute);
      localStorage.setItem('selectedModel', JSON.stringify(fromRoute));
    } else {
      const saved = localStorage.getItem('selectedModel');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedModel(parsed);
        setOriginalModel(parsed);
      }
    }
  }, [location.state]);

  const playHelloSound = async () => {
    try {
      setIsResponding(true);
      setIsPlayingSudaAudio(true);
      await playAudio('hello');
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
      VoiceService.stopListening();
      setIsVoiceActive(false);
      setMicEnabled(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setPermissionGranted(true);

        const started = await VoiceService.startListening(handleVoiceCommand);
        setIsVoiceActive(started);
        setMicEnabled(started);

        if (started) {
          await playHelloSound();
        }
      } catch (error) {
        console.error("Voice init error:", error);
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
      VoiceService.setSystemAudioState(true);

      if (typeof modelName !== 'string') {
        setSelectedModel(modelName);
        setOriginalModel(modelName);
        localStorage.setItem('selectedModel', JSON.stringify(modelName));
        await playAudio('success');
        return;
      }

      const models = await fetchAvailableModels();
      const normalizedInput = modelName.toLowerCase().trim();
      const model = models.find(m =>
        m.name.toLowerCase() === normalizedInput ||
        m.name.toLowerCase().includes(normalizedInput)
      );

      if (model) {
        setSelectedModel(model);
        setOriginalModel(model);
        localStorage.setItem('selectedModel', JSON.stringify(model));
        await playAudio('success');
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
    document.activeElement instanceof HTMLElement && document.activeElement.blur();
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

        <div className={`hologram-center ${isResponding ? 'pulse-effect' : ''}`}>
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
                <img
                  src={selectedModel.src}
                  alt={`${position} Reflection`}
                  className={selectedModel.name === 'Suda' ? 'suda-glow-animation' : ''}
                  onLoad={() => {
                    if (selectedModel.name === 'Suda') {
                      setIsPlayingSudaAudio(true);
                    }
                  }}
                  onError={(e) => (e.currentTarget.src = DEFAULT_MODEL.src)}
                />
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
        <Musics />
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