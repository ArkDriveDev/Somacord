import { IonButton, IonIcon } from '@ionic/react';
import { playCircle } from 'ionicons/icons';

const MusicPlayAll: React.FC = () => {
  return (
    <IonButton expand="block" color="success">
      <IonIcon slot="start" icon={playCircle} />
      Play All
    </IonButton>
  );
};

export default MusicPlayAll;
