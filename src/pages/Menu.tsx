import {
  IonButtons, IonContent, IonHeader, IonIcon, IonItem,
  IonMenu, IonMenuButton, IonMenuToggle, IonPage,
  IonTitle, IonToolbar, IonRouterOutlet
} from '@ionic/react';
import { prismOutline, cubeOutline } from 'ionicons/icons';
import { Route, Redirect } from 'react-router-dom';
import Hologram from './Hologram';
import Models from './Models';
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
            gap: 0px;
            margin-left: -30px; /* Move title closer to menu button */
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
        <IonContent>
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
        </IonRouterOutlet>
      </IonPage>
    </>
  );
};

export default Menu;
