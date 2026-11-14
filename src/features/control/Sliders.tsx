import { IonRange } from '@ionic/react';
import { MAX_BRIGHTNESS, MAX_SPEED, MIN_BRIGHTNESS, MIN_SPEED } from '../../domain/scene';

interface Props {
  speed: number;
  brightness: number;
  onSpeed: (speed: number) => void;
  onBrightness: (brightness: number) => void;
}

/** Speed + brightness. IonRange commits on release (onIonChange), so a drag
 * writes once instead of flooding the backend. */
export function Sliders({ speed, brightness, onSpeed, onBrightness }: Props) {
  return (
    <section className="control__section sliders" data-testid="sliders">
      <label className="slider">
        <span className="hh-kicker">Speed</span>
        <IonRange
          min={MIN_SPEED}
          max={MAX_SPEED}
          step={1}
          snaps
          value={speed}
          aria-label="Speed"
          data-testid="speed-range"
          onIonChange={(e) => onSpeed(Number(e.detail.value))}
        >
          <span slot="start">🐢</span>
          <span slot="end">🐇</span>
        </IonRange>
      </label>
      <label className="slider">
        <span className="hh-kicker">Brightness</span>
        <IonRange
          min={MIN_BRIGHTNESS}
          max={MAX_BRIGHTNESS}
          value={brightness}
          aria-label="Brightness"
          data-testid="brightness-range"
          onIonChange={(e) => onBrightness(Number(e.detail.value))}
        >
          <span slot="start">🌙</span>
          <span slot="end">☀️</span>
        </IonRange>
      </label>
    </section>
  );
}
