import { IonContent, IonPage } from '@ionic/react';
import type { ReactNode } from 'react';
import './auth.css';

/** The shared frame for every auth screen: a title, a subtitle, and the form. */
export function AuthPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <IonPage>
      <IonContent fullscreen className="auth">
        <div className="auth__body">
          <h1 className="auth__title hh-heading">{title}</h1>
          <p className="auth__subtext hh-muted">{subtitle}</p>
          {children}
        </div>
      </IonContent>
    </IonPage>
  );
}

/** The error line + primary CTA every auth form ends with. */
export function AuthSubmit({
  error,
  busy,
  idle,
  working,
  onClick,
  testId,
}: {
  error: string | null;
  busy: boolean;
  idle: string;
  working: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <>
      {error && (
        <p className="auth__error" data-testid={`${testId}-error`}>
          {error}
        </p>
      )}
      <button
        type="button"
        className="auth__cta"
        disabled={busy}
        onClick={onClick}
        data-testid={testId}
      >
        {busy ? working : idle}
      </button>
    </>
  );
}
