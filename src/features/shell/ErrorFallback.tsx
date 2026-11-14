import { IonContent, IonPage } from '@ionic/react';
import './errorBoundary.css';

/** The screen shown when a render crash is caught by ErrorBoundary. Offers a
 * reload (the SPA state is gone, so a full reload is the honest recovery) and a
 * link back to the lights. Styled via --hh-* tokens. */
export function ErrorFallback({ onReload }: { onReload: () => void }) {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="error-fallback" data-testid="error-fallback">
          <span className="error-fallback__emoji" aria-hidden="true">
            🎄
          </span>
          <h2 className="hh-heading error-fallback__title">Something went sideways</h2>
          <p className="hh-muted">
            This screen hit a snag. Reloading usually clears it — your lights keep running.
          </p>
          <button
            type="button"
            className="error-fallback__reload"
            data-testid="error-reload"
            onClick={onReload}
          >
            Reload
          </button>
          <a className="error-fallback__home" href="/lights" data-testid="error-home">
            Back to the lights
          </a>
        </div>
      </IonContent>
    </IonPage>
  );
}
