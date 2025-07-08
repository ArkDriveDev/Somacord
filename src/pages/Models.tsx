// Models.tsx
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonImg
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ModelSearch from '../components/ModelsProps/ModelSearch';

import Orb1 from '../images/Orb1.gif';
import Orb2 from '../images/Orb2.gif';
import Orb3 from '../images/Orb3.gif';
import Orb4 from '../images/Orb4.gif';
import JellyFish1 from '../images/JellyFish1.gif';
import JellyFish2 from '../images/JellyFish2.gif';
import JellyFish3 from '../images/JellyFish3.gif';
import JellyFish4 from '../images/JellyFish4.gif';

interface ImageData {
  id: number;
  name: string;
  src: string;
}

const APP_IMAGES: ImageData[] = [
  { id: 1, name: 'Ball 1.', src: Orb1 },
  { id: 2, name: 'Ball 2.', src: Orb2 },
  { id: 3, name: 'Ball 3.', src: Orb3 },
  { id: 4, name: 'Ball 4.', src: Orb4 },
  { id: 5, name: 'Jellyfish 1.', src: JellyFish1 },
  { id: 6, name: 'Jellyfish 2.', src: JellyFish2 },
  { id: 7, name: 'Jellyfish 3.', src: JellyFish3 },
  { id: 8, name: 'Jellyfish 4.', src: JellyFish4 },
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
