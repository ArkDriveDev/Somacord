import React, { useState } from 'react';
import { IonButton, IonIcon, IonRange } from '@ionic/react';
import { volumeHigh, volumeMute } from 'ionicons/icons';

interface MusicVolumeToggleProps {
  volume: number;          // 0 to 1
  onVolumeChange: (v: number) => void;
}

const MusicVolumeToggle: React.FC<MusicVolumeToggleProps> = ({ volume, onVolumeChange }) => {
  const [showSlider, setShowSlider] = useState(false);

  const isMuted = volume === 0;

  return (
    <div className="volume-toggle-wrapper">
      <IonButton
        color="medium"
        shape="round"
        className="volume-button"
        onClick={() => setShowSlider(!showSlider)}
      >
        <IonIcon icon={isMuted ? volumeMute : volumeHigh} />
      </IonButton>

      {showSlider && (
        <IonRange
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onIonChange={(e) => onVolumeChange(Number(e.detail.value))}
          className="volume-slider"
        />
      )}
    </div>
  );
};

export default MusicVolumeToggle;
