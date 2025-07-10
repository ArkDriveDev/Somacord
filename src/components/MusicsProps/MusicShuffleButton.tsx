import { IonButton, IonIcon } from '@ionic/react';
import { refresh, shuffleOutline } from 'ionicons/icons';

interface MusicShuffleButton {
  onRestart: () => void;
  disabled?: boolean;
}

const MusicShuffleButton: React.FC<MusicShuffleButton> = ({ onRestart, disabled = false }) => {
  return (
    <IonButton 
      color="medium" 
      shape="round"
      onClick={onRestart}
      disabled={disabled}
    >
      <IonIcon icon={shuffleOutline} />
    </IonButton>
  );
};

export default MusicShuffleButton;