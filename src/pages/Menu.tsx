import {
  IonButtons, IonContent, IonHeader, IonIcon, IonItem,
  IonMenu, IonMenuButton, IonMenuToggle, IonPage,
  IonTitle, IonToolbar, IonRouterOutlet
} from '@ionic/react';
import { prismOutline, cubeOutline, micCircleOutline } from 'ionicons/icons';
import { Route, Redirect } from 'react-router-dom';
import Hologram from './Hologram';
import Models from './Models';
import VoiceCommands from './VoiceCommands';
import floating from '../Assets/Tone.png';

const Menu: React.FC = () => {
  const glow = {
    animation: 'blink 2s infinite',
    filter: 'drop-shadow(0 0 6px white)',
  };

  const reversedPyramidStyle = {
    ...glow,
    transform: 'scaleY(-1)',
  };

  const menuItems = [
    { name: 'Hologram', url: '/hologram', icon: prismOutline },
    { name: 'Models', url: '/models', icon: cubeOutline },
    { name: 'Voice Commands', url: '/voicecommands', icon: micCircleOutline },
  ];

  const h1Style = { ...glow, color: 'skyblue' };
  const h2Style = { color: 'skyblue', margin: '3%' };

  return (
    <>
      <style>
        {`
          .fancy-title-container {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-left: -20px;
          }

          .tone-icon {
            height: 20px;
            animation: float 3s ease-in-out infinite;
            filter: drop-shadow(0 0 6px white);
          }

          .fancy-text {
            font-size: 1.1rem;
            font-style: italic;
            font-weight: 500;
            letter-spacing: 0.5px;
            color: skyblue;
            text-shadow: 0 0 4px pink;
            animation: blink 2s infinite;
            line-height: 1;
          }

          .disclaimer-container {
            position: absolute;
            bottom: 10px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 0.7rem;
            color: #aaa;
            padding: 10px 14px;
            line-height: 1.4;
          }

          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
            100% { transform: translateY(0); }
          }

          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.75; }
          }
        `}
      </style>

      <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle style={h1Style}>Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-no-padding">
          {menuItems.map((item, index) => (
            <IonMenuToggle key={index} autoHide={false}>
              <IonItem
                routerLink={item.url}
                routerDirection="none"
                style={h2Style}
              >
                <IonIcon
                  icon={item.icon}
                  slot="start"
                  style={item.icon === prismOutline ? reversedPyramidStyle : glow}
                />
                {item.name}
              </IonItem>
            </IonMenuToggle>
          ))}

          {/* Disclaimer fixed at the bottom of the menu */}
          <div className="disclaimer-container">
            <p>
              All assets used in this project are owned by <strong>Digital Extremes</strong>. This is a fan-made, unofficial project and is not affiliated with or endorsed by Digital Extremes. Content is used under <strong>Fair Use</strong>.
            </p>
          </div>
        </IonContent>
      </IonMenu>

      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton style={h1Style} />
            </IonButtons>

            <IonTitle className="fancy-title-container">
              <img src={floating} alt="Tone" className="tone-icon" />
              <span className="fancy-text">Somachord</span>
              <img src={floating} alt="Tone" className="tone-icon" />
            </IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonRouterOutlet>
          <Route exact path="/" render={() => <Redirect to="/models" />} />
          <Route exact path="/hologram" component={Hologram} />
          <Route exact path="/models" component={Models} />
          <Route exact path="/voicecommands" component={VoiceCommands} />
        </IonRouterOutlet>
      </IonPage>
    </>
  );
};

export default Menu;
