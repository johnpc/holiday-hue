import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import type { ReactNode } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { TabBar } from '../shell/TabBar';
import { type Appearance, APPEARANCES } from './appearance';
import { useAppearance } from './useAppearance';
import './settings.css';

const LABELS: Record<Appearance, string> = { light: 'Light', dark: 'Dark', system: 'System' };

/** Settings: appearance override, account (email + sign out), and an `extra`
 * slot the app fills with the runner status card. */
export function Settings({ extra }: { extra?: ReactNode }) {
  const { email, signOut } = useAuth();
  const { appearance, setAppearance } = useAppearance();
  const history = useHistory();

  const onSignOut = async () => {
    await signOut();
    history.replace('/signin');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="settings">
        <section className="settings__card hh-card">
          <p className="hh-kicker">Appearance</p>
          <IonSegment
            value={appearance}
            data-testid="appearance-segment"
            onIonChange={(e) => setAppearance(e.detail.value as Appearance)}
          >
            {APPEARANCES.map((a) => (
              <IonSegmentButton key={a} value={a} data-testid={`appearance-${a}`}>
                {LABELS[a]}
              </IonSegmentButton>
            ))}
          </IonSegment>
        </section>
        <section className="settings__card hh-card">
          <p className="hh-kicker">Account</p>
          <p className="settings__email" data-testid="account-email">
            {email ?? 'Not signed in'}
          </p>
          <IonButton expand="block" fill="outline" data-testid="sign-out" onClick={onSignOut}>
            Sign out
          </IonButton>
        </section>
        {/* runner status card is mounted by the parent via props */}
        {extra}
      </IonContent>
      <TabBar active="Settings" />
    </IonPage>
  );
}
