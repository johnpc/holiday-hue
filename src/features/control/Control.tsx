import { IonContent, IonHeader, IonPage, IonToolbar } from '@ionic/react';
import { SOLID_THEME_ID } from '../../domain/themes';
import { LoadState } from '../shell/LoadState';
import { TabBar } from '../shell/TabBar';
import { ColorPicker } from './ColorPicker';
import { PatternPicker } from './PatternPicker';
import { PowerRow } from './PowerRow';
import { Preview } from './Preview';
import { SceneCaption } from './SceneCaption';
import { Sliders } from './Sliders';
import { StatusChip } from './StatusChip';
import { TargetPicker } from './TargetPicker';
import { ThemeGrid } from './ThemeGrid';
import { useControl } from './useControl';
import './control.css';

/** The Lights screen: pick a theme + pattern, tune speed/brightness, choose
 * which room, and watch a live preview — every change is written at tap time. */
export function Control() {
  const { scene, isLoading, isError, refetch, set } = useControl();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <div className="control__head">
            <h1 className="control__title hh-heading">Holiday Hue</h1>
            <StatusChip />
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent className="control">
        <LoadState isLoading={isLoading} isError={isError} onRetry={refetch}>
          <Preview scene={scene} caption={<SceneCaption scene={scene} />} />
          <PowerRow on={scene.on} onChange={(on) => set({ on })} />
          <section className="control__section">
            <p className="hh-kicker">Theme</p>
            <ThemeGrid value={scene.themeId} onChange={(themeId) => set({ themeId })} />
            {scene.themeId === SOLID_THEME_ID && (
              <ColorPicker
                value={scene.customColor ?? '#ff1a1a'}
                onChange={(customColor) => set({ customColor })}
              />
            )}
          </section>
          <section className="control__section">
            <p className="hh-kicker">Pattern</p>
            <PatternPicker value={scene.patternId} onChange={(patternId) => set({ patternId })} />
          </section>
          <Sliders
            speed={scene.speed}
            brightness={scene.brightness}
            onSpeed={(speed) => set({ speed })}
            onBrightness={(brightness) => set({ brightness })}
          />
          <section className="control__section">
            <p className="hh-kicker">Which lights</p>
            <TargetPicker value={scene.target} onChange={(target) => set({ target })} />
          </section>
        </LoadState>
      </IonContent>
      <TabBar active="Lights" />
    </IonPage>
  );
}
