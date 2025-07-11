import { IonButton, IonIcon } from '@ionic/react';
import { play, pause } from 'ionicons/icons';

interface MusicPlayButtonProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  disabled?: boolean;  // Add this line
}

const MusicPlayButton: React.FC<MusicPlayButtonProps> = ({ 
  isPlaying, 
  onPlayPause,
  disabled = false  // Add this with default value
}) => {
  return (
    <IonButton 
      onClick={onPlayPause} 
      color="medium" 
      shape="round"
      disabled={disabled}  // Add this
    >
      <IonIcon icon={isPlaying ? pause : play} />
    </IonButton>
  );
};

export default MusicPlayButton;