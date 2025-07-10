import { IonButton, IonIcon } from '@ionic/react';
import { playSkipForward } from 'ionicons/icons';

interface MusicNextProps {
  onClick: () => void;
  disabled: boolean;
}

const MusicNext: React.FC<MusicNextProps> = ({ onClick, disabled }) => {
  return (
    <IonButton 
      color="medium" 
      shape="round" 
      onClick={onClick}
      disabled={disabled}
    >
      <IonIcon icon={playSkipForward} />
    </IonButton>
  );
};

export default MusicNext;