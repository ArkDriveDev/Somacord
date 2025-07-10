import { IonButton, IonIcon } from '@ionic/react';
import { shuffleOutline } from 'ionicons/icons';

interface MusicShuffleButtonProps {
  onRestart: () => void; // ✅ retained as requested
  isShuffle: boolean;
  onToggleShuffle: () => void;
  disabled?: boolean;
}

const MusicShuffleButton: React.FC<MusicShuffleButtonProps> = ({
  onRestart, // ✅ kept for compatibility
  isShuffle,
  onToggleShuffle,
  disabled = false,
}) => {
  return (
    <IonButton
      color={isShuffle ? 'primary' : 'medium'}
      shape="round"
      onClick={onToggleShuffle}
      disabled={disabled}
    >
      <IonIcon icon={shuffleOutline} />
    </IonButton>
  );
};

export default MusicShuffleButton;
