// Models.tsx
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonImg
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState} from 'react';
import ModelSearch from '../components/ModelsProps/ModelSearch';

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

interface ImageData {
  id: number;
  name: string;
  src: string;
}

const APP_IMAGES: ImageData[] = [
  { id: 1, name: 'Ash', src: Ash },
  { id: 2, name: 'Atlas', src: Atlas },
  { id: 3, name: 'Baruuk', src: Baruuk },
  { id: 4, name: 'Banshee', src: Banshee },
  { id: 5, name: 'Caliban', src: Caliban },
  { id: 6, name: 'Chroma', src: Chroma },
  { id: 7, name: 'Citrine', src: Citrine },
  { id: 8, name: 'Dagath', src: Dagath },
  { id: 9, name: 'Ember', src: Ember },
  { id: 10, name: 'Excalibur', src: Excalibur },
  { id: 11, name: 'Equinox', src: Equinox },
  { id: 12, name: 'Frost', src: Frost },
  { id: 13, name: 'Gara', src: Gara },
  { id: 14, name: 'Garuda', src: Garuda },
  { id: 15, name: 'Gauss', src: Gauss },
  { id: 16, name: 'Grendel', src: Grendel },
  { id: 17, name: 'Gyre', src: Gyre },
  { id: 18, name: 'Harrow', src: Harrow },
  { id: 19, name: 'Hildryn', src: Hildryn },
  { id: 20, name: 'Hydroid', src: Hydroid },
  { id: 21, name: 'Inaros', src: Inaros },
  { id: 22, name: 'Ivara', src: Ivara },
  { id: 23, name: 'Kullervo', src: Kullervo },
  { id: 24, name: 'Khora', src: Khora },
  { id: 25, name: 'Lavos', src: Lavos },
  { id: 26, name: 'Limbo', src: Limbo },
  { id: 27, name: 'Loki', src: Loki },
  { id: 28, name: 'Mag', src: Mag },
  { id: 29, name: 'Mesa', src: Mesa },
  { id: 30, name: 'Mirage', src: Mirage },
  { id: 31, name: 'Nekros', src: Nekros },
  { id: 32, name: 'Nezah', src: Nezah },
  { id: 33, name: 'Nidus', src: Nidus },
  { id: 34, name: 'Nova', src: Nova },
  { id: 35, name: 'Nyx', src: Nyx },
  { id: 36, name: 'Oberon', src: Oberon },
  { id: 37, name: 'Octavia', src: Octavia },
  { id: 38, name: 'Protea', src: Protea },
  { id: 39, name: 'Qorvex', src: Qorvex },
  { id: 40, name: 'Revenant', src: Revenant },
  { id: 41, name: 'Rhino', src: Rhino },
  { id: 42, name: 'Saryn', src: Saryn },
  { id: 43, name: 'Sevagoth', src: Sevagoth },
  { id: 44, name: 'Styanax', src: Styanax },
  { id: 45, name: 'Trinity', src: Trinity },
  { id: 46, name: 'Titania', src: Titania },
  { id: 47, name: 'Valkyr', src: Valkyr },
  { id: 48, name: 'Vauban', src: Vauban },
  { id: 49, name: 'Volt', src: Volt },
  { id: 50, name: 'Voruna', src: Voruna },
  { id: 51, name: 'Wisp', src: Wisp },
  { id: 52, name: 'Wukong', src: Wukong },
  { id: 53, name: 'Xaku', src: Xaku },
  { id: 54, name: 'Yareli', src: Yareli },
  { id: 55, name: 'Zephyr', src: Zephyr }
];

const Models: React.FC = () => {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const handleModelClick = (model: ImageData) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Save selected model to localStorage
    localStorage.setItem('selectedModel', JSON.stringify(model));

    history.push({
      pathname: '/hologram',
      state: { model }
    });
  };

  const filteredImages = APP_IMAGES.filter(image =>
    image.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>3D Models</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <ModelSearch onSearch={setSearchQuery} />

        <IonGrid style={{ paddingTop: '20px' }}>
          {filteredImages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No models found</h3>
            </div>
          ) : (
            Array.from({ length: Math.ceil(filteredImages.length / 4) }).map((_, rowIndex) => (
              <IonRow key={rowIndex}>
                {filteredImages.slice(rowIndex * 4, rowIndex * 4 + 4).map((image) => (
                  <IonCol size="6" size-md="3" key={image.id}>
                    <IonCard
                      button
                      onClick={() => handleModelClick(image)}
                      style={{
                        height: '100%',
                        margin: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <IonCardContent style={{ textAlign: 'center' }}>
                        <IonImg
                          src={image.src}
                          alt={image.name}
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'contain',
                            padding: '10px'
                          }}
                        />
                        <h3 style={{
                          margin: '10px 0 5px',
                          fontSize: '1rem',
                          color: '#333'
                        }}>{image.name}</h3>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            ))
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Models;
