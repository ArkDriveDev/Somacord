import React from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/react';

const VoiceCommands: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Voice Command Tutorial</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent color="dark">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>🎶 Playing Music</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>You can use the following commands to play a song:</p>
            <IonList>
              <IonItem lines="none">
                <IonLabel>"Play music Arsenal"</IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonLabel>"Play song Core Containment"</IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonLabel>"Play track Shut It Down"</IonLabel>
              </IonItem>
            </IonList>
            <p>🧠 The system will search and start the corresponding music automatically.</p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>🧬 Changing Model</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>Use these commands to change your Warframe model:</p>
            <IonList>
              <IonItem lines="none">
                <IonLabel>"Change Warframe"</IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonLabel>"Switch Warframe"</IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonLabel>"New Warframe"</IonLabel>
              </IonItem>
            </IonList>
            <p>🎤 You'll be prompted to say the model name.</p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>👋 Greeting Sudha</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>Try greeting your Cephalon AI:</p>
            <IonList>
              <IonItem lines="none">
                <IonLabel>"Hello Sudha"</IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonLabel>"Hey Sudha"</IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonLabel>"Hi Cephalon"</IonLabel>
              </IonItem>
            </IonList>
            <p>💡 Sudha will respond when greeted.</p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>❌ Unknown Commands</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>If your command isn’t recognized, Sudha will notify you.</p>
            <p>Try to use clearer phrases like “Play music [Title]” or “Change Warframe”.</p>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default VoiceCommands;
