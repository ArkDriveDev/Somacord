import React, { useState, useRef, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle
} from '@ionic/react';
import './Musics.css';

// Audio files
import Music1 from '../Musics/Bumble bee.mp3';
import Music2 from '../Musics/Chicken Dance.mp3';
import Music3 from '../Musics/Pretty little baby.mp3';
import Music4 from '../Musics/See tin.mp3';

// Images
import MusicImage from '../images/Music.png';

// Components
import ModelSearch from '../components/ModelsProps/ModelSearch';
import MusicPlayButton from '../components/MusicsProps/MusicPlayButton';
import MusicSpectrum from '../components/MusicsProps/MusicSpectrum';
import MusicRestartButton from '../components/MusicsProps/MusicRestartButton';
import MusicPrevious from '../components/MusicsProps/MusicPrevious';
import MusicNext from '../components/MusicsProps/MusicNext';
import MusicRepeatToggle from '../components/MusicsProps/MusicRepeatToggle';
import SpectrumBars from '../components/MusicsProps/SpectrumBars';

interface MusicItem {
  id: number;
  title: string;
  audioSrc: string;
}

const Musics: React.FC = () => {
  // Original music items
  const musicItems = [
    { id: 1, title: 'Bumble Bee', audioSrc: Music1 },
    { id: 2, title: 'Chicken Dance', audioSrc: Music2 },
    { id: 3, title: 'Pretty Little Baby', audioSrc: Music3 },
    { id: 4, title: 'See Tinh', audioSrc: Music4 },
  ];

  // Initialize audio refs for each music item
  const audioRef1 = useRef<HTMLAudioElement>(null);
  const audioRef2 = useRef<HTMLAudioElement>(null);
  const audioRef3 = useRef<HTMLAudioElement>(null);
  const audioRef4 = useRef<HTMLAudioElement>(null);

  // Create a map of audio refs by ID
  const audioRefs = {
    1: audioRef1,
    2: audioRef2,
    3: audioRef3,
    4: audioRef4,
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [centeredCard, setCenteredCard] = useState<number | null>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [filteredMusicItems, setFilteredMusicItems] = useState<MusicItem[]>(musicItems);
  const [isRepeat, setIsRepeat] = useState(false);

  const handleRestart = () => {
    if (currentPlayingId) {
      const audio = audioRefs[currentPlayingId as keyof typeof audioRefs].current;
      if (audio) {
        audio.currentTime = 0;
        setCurrentProgress(0);
        if (isPlaying) {
          audio.play().catch(error => console.error("Playback failed:", error));
        }
      }
    }
  };

  // Update progress while audio plays
  useEffect(() => {
    const audio = currentPlayingId ? audioRefs[currentPlayingId as keyof typeof audioRefs].current : null;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setCurrentProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [currentPlayingId]);

  // Handle play/pause
 const handlePlayPause = async (id: number) => {
  const audioRef = audioRefs[id as keyof typeof audioRefs].current;
  if (!audioRef) return;

  try {
    if (currentPlayingId === id) {
      if (isPlaying) {
        await audioRef.pause();
      } else {
        await audioRef.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      // Pause currently playing audio if any
      if (currentPlayingId) {
        const currentAudio = audioRefs[currentPlayingId as keyof typeof audioRefs].current;
        if (currentAudio) {
          await currentAudio.pause();
          currentAudio.currentTime = 0; // Reset position if switching tracks
        }
      }
      
      // Play new audio
      audioRef.currentTime = 0;
      await audioRef.play();
      setCurrentPlayingId(id);
      setIsPlaying(true);
    }
  } catch (error) {
    console.error("Playback failed:", error);
    setIsPlaying(false);
  }
};

  // Handle audio ending
  useEffect(() => {
    const handleEnded = () => {
      if (!currentPlayingId) return;

      if (isRepeat) {
        // Repeat the current song
        const audio = audioRefs[currentPlayingId as keyof typeof audioRefs].current;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(error => console.error("Playback failed:", error));
        }
      } else {
        // Proceed to next song
        handleNext();
      }
    };

    Object.values(audioRefs).forEach(ref => {
      const audio = ref.current;
      if (audio) {
        audio.addEventListener('ended', handleEnded);
      }
    });

    return () => {
      Object.values(audioRefs).forEach(ref => {
        const audio = ref.current;
        if (audio) {
          audio.removeEventListener('ended', handleEnded);
        }
      });
    };
  }, [currentPlayingId, filteredMusicItems, isRepeat]); // Add isRepeat to dependencies
  // Scroll handling
  const debounce = (func: Function, timeout = 100) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = debounce(() => {
      const containerCenter = container.offsetWidth / 2;
      const cards = Array.from(container.querySelectorAll('.music-card'));

      let closestCardId: number | null = null;
      let closestDistance = Infinity;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(containerCenter - cardCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestCardId = Number(card.getAttribute('data-id'));
        }
      });

      if (closestCardId !== centeredCard) {
        // Pause currently playing audio if any
        if (currentPlayingId) {
          const currentAudio = audioRefs[currentPlayingId as keyof typeof audioRefs].current;
          if (currentAudio) {
            currentAudio.pause();
            setIsPlaying(false);
            setCurrentProgress(0); // Reset progress bar
          }
        }

        // Update centered card
        setCenteredCard(closestCardId);
      }
    });

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [centeredCard, currentPlayingId]); // Added currentPlayingId to dependencies

  // Search functionality
  const handleSearch = (query: string) => {
    const filtered = musicItems.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMusicItems(filtered);

    // Update centered card to the first item in filtered results (if any)
    const newCenteredCard = filtered.length > 0 ? filtered[0].id : null;
    setCenteredCard(newCenteredCard);

    // If current playing song is not in filtered results, stop playback
    if (currentPlayingId && !filtered.some(item => item.id === currentPlayingId)) {
      audioRefs[currentPlayingId as keyof typeof audioRefs].current?.pause();
      setCurrentPlayingId(null);
      setIsPlaying(false);
      setCurrentProgress(0);
    }

    // If there are filtered results, scroll to the first one
    if (filtered.length > 0 && containerRef.current) {
      setTimeout(() => {
        handleCardClick(filtered[0].id);
      }, 100);
    }
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.touches[0].pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Handle card clicks
  const handleCardClick = (id: number) => {
    const container = containerRef.current;
    if (!container) return;

    const card = container.querySelector(`.music-card[data-id="${id}"]`);
    if (!card) return;

    // Pause currently playing audio if any
    if (currentPlayingId) {
      const currentAudio = audioRefs[currentPlayingId as keyof typeof audioRefs].current;
      if (currentAudio) {
        currentAudio.pause();
        setIsPlaying(false);
        setCurrentProgress(0); // Reset progress
      }
    }

    const containerWidth = container.offsetWidth;
    const cardRect = card.getBoundingClientRect();
    const cardLeft = cardRect.left + container.scrollLeft;
    const cardWidth = cardRect.width;
    const scrollTo = cardLeft - (containerWidth / 2) + (cardWidth / 2);

    container.scrollTo({
      left: scrollTo,
      behavior: 'smooth'
    });

    setCenteredCard(id);
  };

  const handlePrevious = () => {
    if (!currentPlayingId || !centeredCard) return;

    // Find the index of the currently playing song
    const currentIndex = filteredMusicItems.findIndex(item => item.id === centeredCard);

    // If there's a previous song in the array
    if (currentIndex > 0) {
      const prevId = filteredMusicItems[currentIndex - 1].id;

      // Scroll to the previous card
      handleCardClick(prevId);

      // Play the previous song after a small delay to allow scrolling to complete
      setTimeout(() => {
        handlePlayPause(prevId);
      }, 300);
    }
  };

  const handleNext = () => {
    if (!currentPlayingId || !centeredCard) return;

    // Find the index of the currently playing song
    const currentIndex = filteredMusicItems.findIndex(item => item.id === centeredCard);

    // If there's a next song in the array
    if (currentIndex < filteredMusicItems.length - 1) {
      const nextId = filteredMusicItems[currentIndex + 1].id;

      // Scroll to the next card
      handleCardClick(nextId);

      // Play the next song after a small delay to allow scrolling to complete
      setTimeout(() => {
        handlePlayPause(nextId);
      }, 300);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Musics</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <ModelSearch onSearch={handleSearch} />

        <div
          className={`music-container ${isDragging ? 'grabbing' : ''}`}
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <div className="music-scroll-row">
            <div style={{ minWidth: 'calc(50vw - 40%)' }} />

            {filteredMusicItems.map((item) => (
              <div
                key={item.id}
                className="music-col"
                onClick={() => handleCardClick(item.id)}
                style={{ cursor: 'pointer' }}
              >
                <IonCard
                  className={`music-card ${centeredCard === item.id ? 'snap-center' : ''}`}
                  data-id={item.id}
                >
                  <img
                    src={MusicImage}
                    className="music-image"
                    alt={item.title}
                  />
                  <IonCardHeader>
                    <IonCardTitle>{item.title}</IonCardTitle>
                  </IonCardHeader>
                  <audio
                    ref={audioRefs[item.id as keyof typeof audioRefs]}
                    src={item.audioSrc}
                    preload="none"
                  />
                </IonCard>
              </div>
            ))}

            <div style={{ minWidth: 'calc(50vw - 40%)' }} />
          </div>
        </div>

        {/* Player Card */}
        <IonCard className="music-player-card">
          <div className="ion-padding">
            <SpectrumBars
              barCount={30}
              isPlaying={isPlaying}
              audioElement={
                currentPlayingId ?
                  audioRefs[currentPlayingId as keyof typeof audioRefs].current :
                  null
              }
            />
            <MusicSpectrum
              progress={currentProgress}
              onSeek={(newProgress) => {
                const audio = currentPlayingId ? audioRefs[currentPlayingId as keyof typeof audioRefs].current : null;
                if (audio) {
                  audio.currentTime = (newProgress / 100) * audio.duration;
                }
              }}
              disabled={!currentPlayingId}
            />
            <div className="player-controls">
              <MusicPrevious
                onClick={handlePrevious}
                disabled={!currentPlayingId || !centeredCard || filteredMusicItems.findIndex(item => item.id === centeredCard) <= 0}
              />
              <MusicRestartButton
                onRestart={handleRestart}
                disabled={!currentPlayingId}
              />
              <MusicPlayButton
                isPlaying={currentPlayingId !== null && isPlaying}
                onPlayPause={() => centeredCard && handlePlayPause(centeredCard)}
                disabled={!centeredCard}
              />
              <MusicNext
                onClick={handleNext}
                disabled={
                  !currentPlayingId ||
                  !centeredCard ||
                  filteredMusicItems.findIndex(item => item.id === centeredCard) >= filteredMusicItems.length - 1
                }
              />
              <MusicRepeatToggle
                isRepeat={isRepeat}
                onToggle={() => setIsRepeat(!isRepeat)}
              />
            </div>
          </div>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Musics;