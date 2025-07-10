import { IonButton, IonIcon } from '@ionic/react';
import { playSkipBack } from 'ionicons/icons';

interface MusicPreviousProps {
  onClick: () => void;
  disabled: boolean;
}

const MusicPrevious: React.FC<MusicPreviousProps> = ({ onClick, disabled }) => {
  return (
    <IonButton 
      color="medium" 
      shape="round" 
      onClick={onClick}
      disabled={disabled}
    >
      <IonIcon icon={playSkipBack} />
    </IonButton>
  );
};

export default MusicPrevious;