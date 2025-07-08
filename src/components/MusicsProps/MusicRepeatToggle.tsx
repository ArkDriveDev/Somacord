import { IonButton, IonIcon } from '@ionic/react';
import { repeat, repeatOutline } from 'ionicons/icons';

interface MusicRepeatToggleProps {
  isRepeat: boolean;
  onToggle: () => void;
}

const MusicRepeatToggle: React.FC<MusicRepeatToggleProps> = ({ isRepeat, onToggle }) => {
  return (
    <IonButton 
      color={isRepeat ? "danger" : "tertiary"} 
      shape="round"
      onClick={onToggle}
    >
      <IonIcon icon={isRepeat ? repeat : repeatOutline} />
    </IonButton>
  );
};

export default MusicRepeatToggle;