import { IonButton, IonIcon } from '@ionic/react';
import { refresh, shuffleOutline } from 'ionicons/icons';

interface MusicShuffleButtonProps {
  onRestart: () => void;
  onShuffle: () => void;
  isShuffle: boolean;
  disabled?: boolean;
}

const MusicShuffleButton: React.FC<MusicShuffleButtonProps> = ({
  onRestart,
  onShuffle,
  isShuffle,
  disabled = false
}) => {
  return (
    <IonButton
      color="medium"
      shape="round"
      onClick={isShuffle ? onShuffle : onRestart}
      disabled={disabled}
    >
      <IonIcon icon={isShuffle ? shuffleOutline : refresh} />
    </IonButton>
  );
};

export default MusicShuffleButton;
