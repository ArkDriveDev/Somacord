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
import success from '../Assets/Responses/warframe-launcher-sound.wav';
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const modelChangeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Audio refs
  const clemSound = useRef<HTMLAudioElement>(new Audio(clem));
  const successSound = useRef<HTMLAudioElement>(new Audio(success));
  const [showMusicPlayer, setShowMusicPlayer] = useState(true);

  // Handle model switching when responding
  useEffect(() => {
    if (isResponding) {
      // Only update original model if current model isn't Suda
      if (selectedModel.id !== SUDA_MODEL.id) {
        setOriginalModel(selectedModel);
      }
      setSelectedModel(SUDA_MODEL);
    } else {
      // Only revert if currently showing Suda
      if (selectedModel.id === SUDA_MODEL.id) {
        setSelectedModel(originalModel);
      }
    }
  }, [isResponding]);

  // Initialize audio elements
  useEffect(() => {
    clemSound.current.preload = 'auto';
    successSound.current.preload = 'auto';

    try {
      clemSound.current?.load();
    } catch (e) {
      console.error("Failed to load clem audio:", e);
    }
    try {
      successSound.current?.load();
    } catch (e) {
      console.error("Failed to load success audio:", e);
    }

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
      clemSound.current?.pause();
      successSound.current?.pause();
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

  const playHelloSound = () => {
    if (!audioRef.current) return;

    VoiceService.setSystemAudioState(true);
    setIsResponding(true);

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(e => console.error("Audio play error:", e));

    const handleAudioEnd = () => {
      VoiceService.setSystemAudioState(false);
      setIsResponding(false);
      setIsPlayingSudaAudio(false);
    };

    audioRef.current.onended = handleAudioEnd;
    audioRef.current.onerror = handleAudioEnd;
  };

  const handleReverseClick = () => {
    setIsReversed(!isReversed);
    if (clemSound.current) {
      clemSound.current.currentTime = 0;
      clemSound.current.play().catch(e => console.error("Failed to play clem audio:", e));
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
          playHelloSound();
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
        if (successSound.current) {
          await new Promise<void>((resolve) => {
            successSound.current!.currentTime = 0;
            successSound.current!.onended = () => resolve();
            successSound.current!.play().catch(e => {
              console.error("Failed to play success audio:", e);
              resolve();
            });
          });
        }
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
        if (successSound.current) {
          await new Promise<void>((resolve) => {
            successSound.current!.currentTime = 0;
            successSound.current!.onended = () => resolve();
            successSound.current!.play().catch(e => {
              console.error("Failed to play success audio:", e);
              resolve();
            });
          });
        }
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

    try {
      audioRef.current = new Audio(hello);
      audioRef.current.preload = 'auto';
      try {
        audioRef.current?.load();
      } catch (e) {
        console.error("Failed to load hello audio:", e);
      }

      if (audioRef.current) {
        audioRef.current.onended = () => {
          setIsResponding(false);
          setIsPlayingSudaAudio(false);
        };
        audioRef.current.onplay = () => {
          setIsResponding(true);
          setIsPlayingSudaAudio(true);
        };
      }
    } catch (error) {
      console.error("Audio initialization error in useIonViewWillEnter:", error);
    }
  });

  useIonViewWillLeave(() => {
    VoiceService.stopListening();
    setIsVoiceActive(false);
    setIsResponding(false);
    setIsPlayingSudaAudio(false);
    setMicEnabled(false);

    audioRef.current?.pause();
    audioRef.current = null;

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
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.7)',
            border: 'none',
            color: micEnabled ? '#4CAF50' : '#ccc',
            fontSize: '1.5rem',
            zIndex: 1000,
            cursor: 'pointer',
            padding: '10px',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)'
          }}
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
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '550px',
          backgroundColor: '#1a1a1a',
          zIndex: 1000,
          transition: 'transform 0.3s ease-in-out',
          transform: showMusicPlayer ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        <button
          onClick={() => setShowMusicPlayer(false)}
          style={{
            position: 'absolute',
            top: '8px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 1001,
          }}
          title="Hide Music Player"
        >
          <IonIcon icon={chevronDownOutline} />
        </button>
        <Musics />
      </div>

      {!showMusicPlayer && (
        <button
          onClick={() => setShowMusicPlayer(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(0,0,0,0.6)'
          }}
          title="Show Music Player"
        >
          <IonIcon icon={chevronDownOutline} style={{ transform: 'rotate(180deg)' }} />
        </button>
      )}
    </IonPage>
  );
};

export default Hologram;