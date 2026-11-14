import { IonToggle } from '@ionic/react';

/** Master on/off for the whole scene. */
export function PowerRow({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <div className="power hh-card" data-testid="power-row">
      <div>
        <p className="power__title hh-heading">{on ? 'Lights are on' : 'Lights are off'}</p>
        <p className="hh-muted power__sub">
          {on ? 'The runner is animating your scene.' : 'Flip on to start the show.'}
        </p>
      </div>
      <IonToggle
        checked={on}
        aria-label="Lights on"
        data-testid="power-toggle"
        onIonChange={(e) => onChange(e.detail.checked)}
      />
    </div>
  );
}
