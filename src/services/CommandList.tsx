// src/services/CommandList.ts
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

export const CommandList = async (command: string): Promise<{
  action: 'changeModel' | 'hello' | 'unknown' | 'timeout' | 'invalidModel';
  model?: ImageData;
}> => {
  const normalized = command.trim().toLowerCase();

  // 1. Handle model change command
  if (normalized.includes("change warframe")) {
    const modelName = await initiateModelChange();
    
    if (!modelName) {
      await playAudio('failed');
      return { action: 'timeout' };
    }

    const model = await findModelByName(modelName);
    if (model) {
      return { action: 'changeModel', model };
    }

    await playAudio('failed');
    return { action: 'invalidModel' };
  }

  // 2. Handle hello command
  if (normalized.includes("sudha")) {
    await playAudio('suda');
    return { action: 'hello' };
  }

  // 3. Default unknown command
  await playAudio('invalid');
  return { action: 'unknown' };
};

export default CommandList;