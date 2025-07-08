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
import clem from '../Assets/Responses/Clem.mp3';
import success from '../Assets/Responses/warframe-launcher-sound.mp3';
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
  const clemSound = useRef(new Audio(clem)).current;
  const successSound = useRef(new Audio(success)).current;
  const [showMusicPlayer, setShowMusicPlayer] = useState(true);

  useEffect(() => {
    // Initialize audio elements
    clemSound.load();
    successSound.load();

    // Set up aria-hidden observer
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

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fromRoute = location.state?.model;
    if (fromRoute) {
      setSelectedModel(fromRoute);
      localStorage.setItem('selectedModel', JSON.stringify(fromRoute));
    } else {
      const saved = localStorage.getItem('selectedModel');
      if (saved) {
        setSelectedModel(JSON.parse(saved));
      } else {
        setSelectedModel(DEFAULT_MODEL);
      }
    }
  }, [location.state]);

  const playHelloSound = () => {
    if (!audioRef.current) return;

    VoiceService.setSystemAudioState(true);
    setIsResponding(true);

    // Change the model to Suda - the onLoad handler will trigger the animation
    setSelectedModel(SUDA_MODEL);

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(e => console.error("Audio play error:", e));

    const handleAudioEnd = () => {
      VoiceService.setSystemAudioState(false);
      setIsResponding(false);
      setIsPlayingSudaAudio(false);

      // Change back to the previous model
      const saved = localStorage.getItem('selectedModel');
      if (saved) {
        setSelectedModel(JSON.parse(saved));
      } else {
        setSelectedModel(DEFAULT_MODEL);
      }
    };

    audioRef.current.onended = handleAudioEnd;
    audioRef.current.onerror = handleAudioEnd;
  };

  const handleReverseClick = () => {
    setIsReversed(!isReversed);
    clemSound.play().catch(e => console.error("Failed to play audio:", e));
  };

  const toggleMic = async () => {
    if (micEnabled) {
      // Turn off mic
      VoiceService.stopListening();
      setIsVoiceActive(false);
      setMicEnabled(false);
    } else {
      // Turn on mic
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
      VoiceService.setSystemAudioState(true); // Pause recognition

      // If it's already a model object (from click)
      if (typeof modelName !== 'string') {
        setSelectedModel(modelName);
        localStorage.setItem('selectedModel', JSON.stringify(modelName));
        await new Promise<void>((resolve) => {
          successSound.onended = () => resolve();
          successSound.onerror = () => resolve();
          successSound.play().catch(e => {
            console.error("Failed to play audio:", e);
            resolve();
          });
        });
        return;
      }

      // If it's a string (from voice command)
      const models = await fetchAvailableModels();
      const normalizedInput = modelName.toLowerCase().trim();

      const model = models.find(m =>
        m.name.toLowerCase() === normalizedInput ||
        m.name.toLowerCase().includes(normalizedInput)
      );

      if (model) {
        setSelectedModel(model);
        localStorage.setItem('selectedModel', JSON.stringify(model));
        await new Promise<void>((resolve) => {
          successSound.onended = () => resolve();
          successSound.onerror = () => resolve();
          successSound.play().catch(e => {
            console.error("Failed to play audio:", e);
            resolve();
          });
        });
      }
    } catch (error) {
      console.error("Model change error:", error);
    } finally {
      VoiceService.setSystemAudioState(false); // Resume recognition
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

    // Only initialize the audio, don't play it automatically
    audioRef.current = new Audio(hello);
    audioRef.current.preload = 'auto';

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

    // Clear model from localStorage
    localStorage.removeItem('selectedModel');
  });

  return (
    <IonPage style={{ backgroundColor: 'black' }}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{selectedModel.name}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="hologram-container">
        {/* Mic Toggle Button - Fixed position in top right */}
        <button
          onClick={toggleMic}
          style={{
            position: 'fixed',
            top: '80px', // Below the header
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
                  className={isPlayingSudaAudio ? 'suda-glow-animation' : ''}
                  onLoad={(e) => {
                    if (selectedModel.name === 'Suda' && !isPlayingSudaAudio) {
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

      {/* Music Player Section */}
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

      {/* Show Music Player Button (when hidden) */}
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