import { IonButton, IonIcon } from '@ionic/react';
import { refresh } from 'ionicons/icons';

interface MusicRestartButtonProps {
  onRestart: () => void;
  disabled?: boolean;
}

const MusicRestartButton: React.FC<MusicRestartButtonProps> = ({ onRestart, disabled = false }) => {
  return (
    <IonButton 
      color="medium" 
      shape="round"
      onClick={onRestart}
      disabled={disabled}
    >
      <IonIcon icon={refresh} />
    </IonButton>
  );
};

export default MusicRestartButton;