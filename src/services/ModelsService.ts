// src/services/ModelsService.ts
export interface ImageData { 
  id: number;
  name: string;
  src: string;
}

// Import images directly
import Ash from '../Assets/Warframes/Ash.png';
import Atlas from '../Assets/Warframes/Atlas.png';
import Baruuk from '../Assets/Warframes/Baruuk.png';
import Banshee from '../Assets/Warframes/Banshee.png';
import Caliban from '../Assets/Warframes/Caliban.png';
import Chroma from '../Assets/Warframes/Chroma.png';
import Citrine from '../Assets/Warframes/Citrine.png';
import Dagath from '../Assets/Warframes/Dagath.png';
import Ember from '../Assets/Warframes/Ember.png';
import Excalibur from '../Assets/Warframes/Excalibur.png';
import Equinox from '../Assets/Warframes/Equinox.png';
import Frost from '../Assets/Warframes/Frost.png';
import Gara from '../Assets/Warframes/Gara.png';
import Garuda from '../Assets/Warframes/Garuda.png';
import Gauss from '../Assets/Warframes/Gauss.png';
import Grendel from '../Assets/Warframes/Grendel.png';
import Gyre from '../Assets/Warframes/Gyre.png';
import Harrow from '../Assets/Warframes/Harrow.png';
import Hildryn from '../Assets/Warframes/Hildryn.png';
import Hydroid from '../Assets/Warframes/Hydroid.png';
import Inaros from '../Assets/Warframes/Inaros.png';
import Ivara from '../Assets/Warframes/Ivara.png';
import Kullervo from '../Assets/Warframes/Kullervo.png';
import Khora from '../Assets/Warframes/Khora.png';
import Lavos from '../Assets/Warframes/Lavos.png';
import Limbo from '../Assets/Warframes/Limbo.png';
import Loki from '../Assets/Warframes/Loki.png';
import Mag from '../Assets/Warframes/Mag.png';
import Mesa from '../Assets/Warframes/Mesa.png';
import Mirage from '../Assets/Warframes/Mirage.png';
import Nekros from '../Assets/Warframes/Nekros.png';
import Nezah from '../Assets/Warframes/Nezah.png';
import Nidus from '../Assets/Warframes/Nidus.png';
import Nova from '../Assets/Warframes/Nova.png';
import Nyx from '../Assets/Warframes/Nyx.png';
import Oberon from '../Assets/Warframes/Oberon.png';
import Octavia from '../Assets/Warframes/Octavia.png';
import Protea from '../Assets/Warframes/Protea.png';
import Qorvex from '../Assets/Warframes/Qorvex.png';
import Revenant from '../Assets/Warframes/Revenant.png';
import Rhino from '../Assets/Warframes/Rhino.png';
import Saryn from '../Assets/Warframes/Saryn.png';
import Sevagoth from '../Assets/Warframes/Sevagoth.png';
import Styanax from '../Assets/Warframes/Styanax.png';
import Trinity from '../Assets/Warframes/Trinity.png';
import Titania from '../Assets/Warframes/Titania.png';
import Valkyr from '../Assets/Warframes/Valkyr.png';
import Vauban from '../Assets/Warframes/Vauban.png';
import Volt from '../Assets/Warframes/Volt.png';
import Voruna from '../Assets/Warframes/Voruna.png';
import Wisp from '../Assets/Warframes/Wisp.png';
import Wukong from '../Assets/Warframes/Wukong.png';
import Xaku from '../Assets/Warframes/Xaku.png';
import Yareli from '../Assets/Warframes/Yareli.png';
import Zephyr from '../Assets/Warframes/Zephyr.png';

const LOCAL_MODELS: ImageData[] = [
  { id: 1, name: 'Ash.', src: Ash },
{ id: 2, name: 'Atlas.', src: Atlas },
{ id: 3, name: 'Baruuk.', src: Baruuk },
{ id: 4, name: 'Banshee.', src: Banshee },
{ id: 5, name: 'Caliban.', src: Caliban },
{ id: 6, name: 'Chroma.', src: Chroma },
{ id: 7, name: 'Citrine.', src: Citrine },
{ id: 8, name: 'Dagath.', src: Dagath },
{ id: 9, name: 'Ember.', src: Ember },
{ id: 10, name: 'Excalibur.', src: Excalibur },
{ id: 11, name: 'Equinox.', src: Equinox },
{ id: 12, name: 'Frost.', src: Frost },
{ id: 13, name: 'Gara.', src: Gara },
{ id: 14, name: 'Garuda.', src: Garuda },
{ id: 15, name: 'Gauss.', src: Gauss },
{ id: 16, name: 'Grendel.', src: Grendel },
{ id: 17, name: 'Gyre.', src: Gyre },
{ id: 18, name: 'Harrow.', src: Harrow },
{ id: 19, name: 'Hildryn.', src: Hildryn },
{ id: 20, name: 'Hydroid.', src: Hydroid },
{ id: 21, name: 'Inaros.', src: Inaros },
{ id: 22, name: 'Ivara.', src: Ivara },
{ id: 23, name: 'Kullervo.', src: Kullervo },
{ id: 24, name: 'Khora.', src: Khora },
{ id: 25, name: 'Lavos.', src: Lavos },
{ id: 26, name: 'Limbo.', src: Limbo },
{ id: 27, name: 'Loki.', src: Loki },
{ id: 28, name: 'Mag.', src: Mag },
{ id: 29, name: 'Mesa.', src: Mesa },
{ id: 30, name: 'Mirage.', src: Mirage },
{ id: 31, name: 'Nekros.', src: Nekros },
{ id: 32, name: 'Nezah.', src: Nezah },
{ id: 33, name: 'Nidus.', src: Nidus },
{ id: 34, name: 'Nova.', src: Nova },
{ id: 35, name: 'Nyx.', src: Nyx },
{ id: 36, name: 'Oberon.', src: Oberon },
{ id: 37, name: 'Octavia.', src: Octavia },
{ id: 38, name: 'Protea.', src: Protea },
{ id: 39, name: 'Qorvex.', src: Qorvex },
{ id: 40, name: 'Revenant.', src: Revenant },
{ id: 41, name: 'Rhino.', src: Rhino },
{ id: 42, name: 'Saryn.', src: Saryn },
{ id: 43, name: 'Sevagoth.', src: Sevagoth },
{ id: 44, name: 'Styanax.', src: Styanax },
{ id: 45, name: 'Trinity.', src: Trinity },
{ id: 46, name: 'Titania.', src: Titania },
{ id: 47, name: 'Valkyr.', src: Valkyr },
{ id: 48, name: 'Vauban.', src: Vauban },
{ id: 49, name: 'Volt.', src: Volt },
{ id: 50, name: 'Voruna.', src: Voruna },
{ id: 51, name: 'Wisp.', src: Wisp },
{ id: 52, name: 'Wukong.', src: Wukong },
{ id: 53, name: 'Xaku.', src: Xaku },
{ id: 54, name: 'Yareli.', src: Yareli },
{ id: 55, name: 'Zephyr.', src: Zephyr }
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