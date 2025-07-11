import changemodel from '../Assets/Responses/Suda3.wav';
import invalid from '../Assets/Responses/Suda6.wav';
import suda from '../Assets/Responses/Suda2.wav';
import failed from '../Assets/Responses/Suda5.wav';
import playmusic from '../Assets/Responses/Suda4.wav';
import { findModelByName, ImageData } from './ModelsService';
import VoiceService from './VoiceService';

// Audio cache
const audioCache: Record<string, HTMLAudioElement> = {};

// Preload all audio files
const preloadAudio = (sound: string, url: string) => {
  const audio = new Audio(url);
  audio.volume = 0.8;
  audio.preload = 'auto';
  audioCache[sound] = audio;
};

// Initialize audio cache
preloadAudio('suda', suda);
preloadAudio('invalid', invalid);
preloadAudio('changemodel', changemodel);
preloadAudio('failed', failed);
preloadAudio('playmusic', playmusic);

const playAudio = async (sound: string): Promise<void> => {
  try {
    VoiceService.setSystemAudioState(true);
    const audio = audioCache[sound].cloneNode(true) as HTMLAudioElement;
    await audio.play();
    await new Promise<void>((resolve) => {
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
    });
  } catch (err) {
    console.error("Audio playback error:", err);
  } finally {
    VoiceService.setSystemAudioState(false);
  }
};

export const initiateModelChange = async (): Promise<string | null> => {
  await playAudio('changemodel');
  return new Promise((resolve) => {
    VoiceService.startModelSelection(6000, (modelName) => {
      resolve(modelName || null);
    });
  });
};

// Music title to ID mapping
const musicTitles = [
  { id: 1, title: 'pick a side.', aliases: ['pick side.'] },
  { id: 2, title: 'Arsenal.' },
  { id: 3, title: 'core containment.', aliases: ['core.'] },
  { id: 4, title: 'cut through.', aliases: ['cut.'] },
  { id: 5, title: 'from the stars.', aliases: ['stars.'] },
  { id: 6, title: 'lamenting the days.', aliases: ['lamenting.', 'days.'] },
  { id: 7, title: 'infection.' },
  { id: 8, title: 'numb.' },
  { id: 9, title: 'party of your lifetime.', aliases: ['party.', 'lifetime.'] },
  { id: 10, title: 'rotten lives.', aliases: ['rotten.', 'lives.'] },
  { id: 11, title: 'see it in the flesh.', aliases: ['flesh.'] },
  { id: 12, title: 'the call.', aliases: ['call.'] },
  { id: 13, title: 'shut it down.', aliases: ['shut down.'] },
  { id: 14, title: 'the great despair.', aliases: ['great despair.', 'despair.'] }
];

const getMusicIdFromTitle = (inputTitle: string): number | null => {
  const normalizedTitle = inputTitle.toLowerCase().trim();

  // First try exact match
  const exactMatch = musicTitles.find(m =>
    m.title.toLowerCase() === normalizedTitle ||
    m.aliases?.some(a => a.toLowerCase() === normalizedTitle)
  );
  if (exactMatch) return exactMatch.id;

  // Then try partial matches
  for (const track of musicTitles) {
    if (normalizedTitle.includes(track.title.toLowerCase()) ||
      track.title.toLowerCase().includes(normalizedTitle) ||
      track.aliases?.some(a => normalizedTitle.includes(a.toLowerCase()))) {
      return track.id;
    }
  }

  return null;
};

export const CommandList = async (command: string): Promise<{
  action: 'changeModel' | 'hello' | 'unknown' | 'timeout' | 'invalidModel' | 'playMusic';
  model?: ImageData;
  musicId?: number;
  musicTitle?: string;
  shouldResetModel?: boolean;
}> => {
  const normalized = command.trim().toLowerCase();

  // 1. Play music commands
  if (normalized.includes("play music") ||
    normalized.includes("play song") ||
    normalized.includes("play track")) {
    await playAudio('playmusic');

    // Extract title after play command
    const parts = command.split(/play music|play song|play track/i);
    const titlePart = parts[1]?.trim() || "";
    
    if (titlePart.length > 0) {
      const musicId = getMusicIdFromTitle(titlePart);
      if (musicId) {
        return { 
          action: 'playMusic', 
          musicId,
          shouldResetModel: true // Will trigger model reset
        };
      }
      return { 
        action: 'playMusic', 
        musicTitle: titlePart,
        shouldResetModel: true 
      };
    }
    return { 
      action: 'playMusic',
      shouldResetModel: true 
    };
  }

  // 2. Handle model change command
  if (normalized.includes("change warframe") ||
    normalized.includes("switch warframe") ||
    normalized.includes("new warframe")) {
    const modelName = await initiateModelChange();

    if (!modelName) {
      await playAudio('failed');
      return { 
        action: 'timeout',
        shouldResetModel: true 
      };
    }

    const model = await findModelByName(modelName);
    if (model) {
      return { 
        action: 'changeModel', 
        model,
        shouldResetModel: false // Keep the new model
      };
    }

    await playAudio('failed');
    return { 
      action: 'invalidModel',
      shouldResetModel: true 
    };
  }

  // 3. Handle hello/greeting commands
  const greetings = [
    'suda',
    'sudha',
    'hello, sudha',
    'hello sudha',
    'hello suda',
    'hi, sudha',
    'hi sudha',
    'hi suda',
    'hey sudha',
    'hey suda',
    'greetings sudha',
    'greetings suda',
    'hello cephalon',
    'hi cephalon'
  ];
  if (greetings.some(g => normalized.includes(g))) {
    await playAudio('suda');
    return { 
      action: 'hello',
      shouldResetModel: true 
    };
  }

  // 4. Default unknown command
  await playAudio('invalid');
  return { 
    action: 'unknown',
    shouldResetModel: true 
  };
};

export default CommandList;