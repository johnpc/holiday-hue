import { IonButton, IonContent, IonPage, IonSpinner } from '@ionic/react';
import type { ReactNode } from 'react';
import { Redirect } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import './household.css';

const HOUSEHOLD_GROUP = 'editors';

/** Only household members (Cognito `editors` group) may see or run the lights.
 * Signed out → sign in; signed in but not a member → a friendly dead end. */
export function HouseholdGate({ children }: { children: ReactNode }) {
  const { status, groups, email, signOut } = useAuth();
  if (status === 'loading') {
    return (
      <IonPage>
        <IonContent className="household household--center" data-testid="household-loading">
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }
  if (status === 'unauthenticated') return <Redirect to="/signin" />;
  if (!groups.includes(HOUSEHOLD_GROUP)) {
    return (
      <IonPage>
        <IonContent className="household household--center" data-testid="household-denied">
          <div className="household__card hh-card">
            <p className="household__emoji" aria-hidden>
              🎄
            </p>
            <h2 className="hh-heading">Not in the household yet</h2>
            <p className="hh-muted">
              You're signed in as <strong>{email}</strong>, but this account hasn't been added to
              the household. Ask John to add you, then sign in again.
            </p>
            <IonButton
              fill="outline"
              data-testid="household-sign-out"
              onClick={() => void signOut()}
            >
              Sign out
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }
  return <>{children}</>;
}
