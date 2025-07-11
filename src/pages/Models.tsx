import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonImg
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ModelSearch from '../components/ModelsProps/ModelSearch';
import warframesData from '../Assets/warframes.json';

interface Warframe {
  id: number;
  name: string;
}

interface ImageData extends Warframe {
  src: string;
}

const Models: React.FC = () => {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Dynamically import all images
  useEffect(() => {
    const loadImages = async () => {
      const imageModules = await Promise.all(
        warframesData.map(async (frame) => {
          try {
            const module = await import(`../Assets/Warframes/${frame.name}.png`);
            return { name: frame.name, src: module.default };
          } catch (error) {
            console.warn(`Image not found for ${frame.name}`);
            return { name: frame.name, src: '' }; // Fallback for missing images
          }
        })
      );

      const loadedImages = imageModules.reduce<Record<string, string>>((acc, curr) => {
        acc[curr.name] = curr.src;
        return acc;
      }, {});

      setImages(loadedImages);
      setIsLoading(false);
    };

    loadImages();
  }, []);

  const handleModelClick = (model: Warframe) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    localStorage.setItem('selectedModel', JSON.stringify({
      id: model.id,
      name: model.name,
      src: images[model.name]
    }));

    history.push({
      pathname: '/hologram',
      state: { 
        model: {
          id: model.id,
          name: model.name,
          src: images[model.name]
        } 
      }
    });
  };

  const filteredImages = warframesData.filter(image =>
    image.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>3D Models</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>Loading models...</h3>
          </div>
        </IonContent>
      </IonPage>
    );
  }

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
                          src={images[image.name]}
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