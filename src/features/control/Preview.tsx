import type { SceneState } from '../../domain/scene';
import { PREVIEW_BULBS, usePreviewFrame } from './usePreviewFrame';

/** A string of bulbs animated by the real pattern engine. */
export function Preview({ scene }: { scene: SceneState }) {
  const frames = usePreviewFrame(scene);
  return (
    <div className="preview hh-card" data-testid="preview" data-on={scene.on}>
      <div className="preview__wire" />
      {Array.from({ length: PREVIEW_BULBS }, (_, i) => {
        const f = frames[i];
        const style = f
          ? {
              background: f.color,
              opacity: 0.35 + (f.brightness / 100) * 0.65,
              boxShadow: `0 0 18px ${f.color}`,
            }
          : undefined;
        return (
          <span key={i} className="preview__bulb" data-testid="preview-bulb" data-lit={!!f}>
            <span className="preview__socket" />
            <span className="preview__glass" style={style} />
          </span>
        );
      })}
    </div>
  );
}
