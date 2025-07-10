import React, { useState, useRef, useEffect, forwardRef } from 'react';
import {
  IonContent,
  IonCard, IonCardHeader, IonCardTitle
} from '@ionic/react';
import './Musics.css';

// Audio files
import PickASide from '../Assets/Musics/Pick a Side.mp3';
import Arsenal from '../Assets/Musics/Arsenal.mp3';
import CoreContainment from '../Assets/Musics/Core Containment.mp3';
import CutThrough from '../Assets/Musics/Cut Through.mp3';
import FromTheStars from '../Assets/Musics/From The Stars.mp3';
import LamentingTheDays from '../Assets/Musics/Lamenting The Days.mp3';
import Infection from '../Assets/Musics/Infection.mp3';
import Numb from '../Assets/Musics/Numb.mp3';
import PartyOfYourLifetime from '../Assets/Musics/Party Of Your Lifetime.mp3';
import RottenLives from '../Assets/Musics/Rotten Lives.mp3';
import SeeItInTheFlesh from '../Assets/Musics/See It In The Flesh.mp3';
import TheCall from '../Assets/Musics/The Call.mp3';
import ShutItDown from '../Assets/Musics/Shut It Down.mp3';
import TheGreatDespair from '../Assets/Musics/The Great Despair.mp3';

// Images
import MusicImage from '../Assets/Warframe 1999.jpg';
import MusicImage2 from '../Assets/On-lyne.jpg';
import MusicImage3 from '../Assets/Techrot Encore.jpg'

// Components
import ModelSearch from '../components/ModelsProps/ModelSearch';
import MusicPlayButton from '../components/MusicsProps/MusicPlayButton';
import MusicSpectrum from '../components/MusicsProps/MusicSpectrum';
import MusicPrevious from '../components/MusicsProps/MusicPrevious';
import MusicNext from '../components/MusicsProps/MusicNext';
import MusicRepeatToggle from '../components/MusicsProps/MusicRepeatToggle';
import SpectrumBars from '../components/MusicsProps/SpectrumBars';
import MusicShuffleButton from '../components/MusicsProps/MusicShuffleButton';

interface MusicItem {
  id: number;
  title: string;
  audioSrc: string;
  imageSrc: string; // ✅ Add this line
}

interface MusicPlayerHandle {
  pause: () => void;
  playTrack: (id: number) => void;
  searchTrack?: (title: string) => void; // Add this new method
}

interface MusicsProps {
  isMicActive?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onPlayRequest?: () => void;
}

const Musics = forwardRef<MusicPlayerHandle, MusicsProps>(
  ({ isMicActive, onPlayStateChange, onPlayRequest }, ref) => {
    // Original music items
    const musicItems = [
      { id: 1, title: 'Pick a Side', audioSrc: PickASide, imageSrc: MusicImage },
      { id: 2, title: 'Arsenal.', audioSrc: Arsenal, imageSrc: MusicImage },
      { id: 3, title: 'Core Containment', audioSrc: CoreContainment, imageSrc: MusicImage },
      { id: 4, title: 'Cut Through', audioSrc: CutThrough, imageSrc: MusicImage },
      { id: 5, title: 'From The Stars', audioSrc: FromTheStars, imageSrc: MusicImage3 },
      { id: 6, title: 'Lamenting The Days', audioSrc: LamentingTheDays, imageSrc: MusicImage3 },
      { id: 7, title: 'Infection', audioSrc: Infection, imageSrc: MusicImage },
      { id: 8, title: 'Numb', audioSrc: Numb, imageSrc: MusicImage },
      { id: 9, title: 'party of your lifetime', audioSrc: PartyOfYourLifetime, imageSrc: MusicImage2 },
      { id: 10, title: 'Rotten Lives', audioSrc: RottenLives, imageSrc: MusicImage },
      { id: 11, title: 'See It In The Flesh', audioSrc: SeeItInTheFlesh, imageSrc: MusicImage },
      { id: 12, title: 'The Call', audioSrc: TheCall, imageSrc: MusicImage },
      { id: 13, title: 'Shut It Down', audioSrc: ShutItDown, imageSrc: MusicImage },
      { id: 14, title: 'The Great Despair', audioSrc: TheGreatDespair, imageSrc: MusicImage },
    ];

    // Initialize audio refs for all 14 music tracks
    const audioRef1 = useRef<HTMLAudioElement>(null);
    const audioRef2 = useRef<HTMLAudioElement>(null);
    const audioRef3 = useRef<HTMLAudioElement>(null);
    const audioRef4 = useRef<HTMLAudioElement>(null);
    const audioRef5 = useRef<HTMLAudioElement>(null);
    const audioRef6 = useRef<HTMLAudioElement>(null);
    const audioRef7 = useRef<HTMLAudioElement>(null);
    const audioRef8 = useRef<HTMLAudioElement>(null);
    const audioRef9 = useRef<HTMLAudioElement>(null);
    const audioRef10 = useRef<HTMLAudioElement>(null);
    const audioRef11 = useRef<HTMLAudioElement>(null);
    const audioRef12 = useRef<HTMLAudioElement>(null);
    const audioRef13 = useRef<HTMLAudioElement>(null);
    const audioRef14 = useRef<HTMLAudioElement>(null);

    // Map audio refs by track ID (1-14)
    const audioRefs = {
      1: audioRef1,
      2: audioRef2,
      3: audioRef3,
      4: audioRef4,
      5: audioRef5,
      6: audioRef6,
      7: audioRef7,
      8: audioRef8,
      9: audioRef9,
      10: audioRef10,
      11: audioRef11,
      12: audioRef12,
      13: audioRef13,
      14: audioRef14,
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
    const [searchQuery, setSearchQuery] = useState('');


    // In Musics.tsx
    React.useImperativeHandle(ref, () => ({
      pause: () => {
        if (currentPlayingId) {
          audioRefs[currentPlayingId as keyof typeof audioRefs].current?.pause();
          setIsPlaying(false);
          onPlayStateChange?.(false);
        }
      },
      playTrack: (id: number) => {
        const track = musicItems.find(item => item.id === id);
        if (track) {
          handleSearch(track.title);
          setTimeout(() => handlePlayPause(id), 500);
        }
      },
      searchTrack: (title: string) => {
        handleSearch(title, true); // true = skip filtering
        setSearchQuery(title); // Just update the UI
        const match = musicItems.find(item =>
          item.title.toLowerCase().includes(title.toLowerCase())
        );

        if (match) {
          handleCardClick(match.id); // Only scroll
          return match;
        }
        return null;
      }
    }));

    useEffect(() => {
      setFilteredMusicItems(musicItems);
    }, []);

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

    useEffect(() => {
      if (isMicActive && isPlaying) {
        const audioRef = currentPlayingId
          ? audioRefs[currentPlayingId as keyof typeof audioRefs].current
          : null;

        if (audioRef) {
          const handlePause = async () => {
            try {
              await audioRef.pause();
              setIsPlaying(false);
              if (onPlayStateChange) {
                onPlayStateChange(false);
              }
            } catch (error) {
              console.error("Pause error:", error);
            }
          };

          handlePause();
        }
      }
    }, [isMicActive]); // Only trigger when mic state changes

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

    const handlePlayPause = async (id: number) => {
      const audioRef = audioRefs[id as keyof typeof audioRefs].current;
      if (!audioRef) return;

      try {
        // 👇 NEW: Request mic toggle (e.g., disable it before playing)
        if (!isPlaying && onPlayRequest) {
          onPlayRequest();
        }

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
              currentAudio.currentTime = 0;
            }
          }

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
    }, [currentPlayingId, filteredMusicItems, isRepeat]);

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
              setCurrentProgress(0);
              onPlayStateChange?.(false);
            }
          }

          // Update centered card
          setCenteredCard(closestCardId);
        }
      });

      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }, [centeredCard, currentPlayingId]);

    // Search functionality
    const handleSearch = (query: string, skipFiltering = false) => {
      setSearchQuery(query); // Update the search bar text

      // Always search through all music items, not just filtered ones
      const match = musicItems.find(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );

      if (match) {
        handleCardClick(match.id); // Scroll to the matched card
      }

      // Reset filtered items to show all (in case previous search had filtered them)
      if (filteredMusicItems.length !== musicItems.length) {
        setFilteredMusicItems(musicItems);
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
          setCurrentProgress(0);
          onPlayStateChange?.(false);
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
                  <div
                    className="music-image-bg"
                    style={{ backgroundImage: `url(${item.imageSrc})` }}
                  >
                    <IonCardHeader className="overlay-header">
                      <IonCardTitle>{item.title}</IonCardTitle>
                    </IonCardHeader>
                  </div>
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
              <MusicShuffleButton
                onRestart={handleRestart}
                disabled={!currentPlayingId}
              />
              <MusicPrevious
                onClick={handlePrevious}
                disabled={!currentPlayingId || !centeredCard || filteredMusicItems.findIndex(item => item.id === centeredCard) <= 0}
              />
              <MusicPlayButton
                isPlaying={currentPlayingId !== null && isPlaying}
                onPlayPause={() => centeredCard && handlePlayPause(centeredCard)}
                disabled={!centeredCard}  // Only disabled if no track is selected
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
    );
  }
);

Musics.displayName = 'Musics';

export default Musics;
export type { MusicPlayerHandle };