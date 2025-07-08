// src/services/ModelsService.ts
export interface ImageData { 
  id: number;
  name: string;
  src: string;
}

// Import images directly
import Orb1 from '../images/Orb1.gif';
import Orb2 from '../images/Orb2.gif';
import Orb3 from '../images/Orb3.gif';
import Orb4 from '../images/Orb4.gif';
import JellyFish1 from '../images/JellyFish1.gif';
import JellyFish2 from '../images/JellyFish2.gif';
import JellyFish3 from '../images/JellyFish3.gif';
import JellyFish4 from '../images/JellyFish4.gif';

const LOCAL_MODELS: ImageData[] = [
  { id: 1, name: 'Ball one.', src: Orb1 },
  { id: 2, name: 'Ball 2.', src: Orb2 },
  { id: 3, name: 'Ball 3.', src: Orb3 },
  { id: 4, name: 'Ball 4.', src: Orb4 },
  { id: 5, name: 'Jellyfish one.', src: JellyFish1 },
  { id: 6, name: 'Jellyfish 2.', src: JellyFish2 },
  { id: 7, name: 'Jellyfish 3.', src: JellyFish3 },
  { id: 8, name: 'Jellyfish 4.', src: JellyFish4 },
];

// Rest of your existing code remains the same...
export const fetchAvailableModels = async (): Promise<ImageData[]> => {
  return Promise.resolve(LOCAL_MODELS);
};

export const findModelByName = async (name: string): Promise<ImageData | null> => {
  const models = await fetchAvailableModels();
  const normalizedInput = name.toLowerCase().trim();
  
  // Try exact match first
  const exactMatch = models.find(m => m.name.toLowerCase() === normalizedInput);
  if (exactMatch) return exactMatch;
  
  // Then try partial match
  return models.find(m => 
    m.name.toLowerCase().includes(normalizedInput)
  ) || null;
};

export const getModelVoiceNames = (): string[] => {
  return LOCAL_MODELS.flatMap(model => [
    model.name.toLowerCase(),
    ...model.name.toLowerCase().split(' '),
    model.id.toString()
  ]);
};