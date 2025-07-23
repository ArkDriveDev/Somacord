import { IonSpinner } from '@ionic/react';

const Loading: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    <IonSpinner name="crescent" />
  </div>
);

export default Loading;