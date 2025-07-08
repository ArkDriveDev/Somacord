import {
  IonButtons, IonContent, IonHeader, IonIcon, IonItem,
  IonMenu, IonMenuButton, IonMenuToggle, IonPage, 
  IonTitle, IonToolbar, IonRouterOutlet
} from '@ionic/react';
import { prismOutline, cubeOutline} from 'ionicons/icons';
import { Route, Redirect} from 'react-router-dom';
import Hologram from './Hologram';
import Models from './Models';

const Menu: React.FC = () => {
  const glow = { 
    animation: 'blink 2s infinite', 
    filter: 'drop-shadow(0 0 8px white)',
  };

  const reversedPyramidStyle = {
    ...glow,
    transform: 'scaleY(-1)'
  };

  const menuItems = [
    { name: 'Hologram', url: '/hologram', icon: prismOutline },
    { name: 'Models', url: '/models', icon: cubeOutline },
  ]; 

  const h1Style = { ...glow, color: 'skyblue' };
  const h2Style = { color: 'skyblue', margin: '3%' };

  return (
    <>
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
            <IonTitle style={{ color: 'skyblue' }}>Somacord</IonTitle>
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