import { findPattern } from '../../domain/patterns';
import type { SceneState } from '../../domain/scene';
import { findTheme } from '../../domain/themes';
import { useLights } from './lightsApi';
import { groupRooms, targetLabel } from './rooms';

/** One line under the preview: what's running, how, and where. */
export function SceneCaption({ scene }: { scene: SceneState }) {
  const { data: lights = [] } = useLights();
  const where = targetLabel(scene.target, groupRooms(lights));
  const count =
    scene.target === 'all' ? lights.length : lights.filter((l) => l.roomId === scene.target).length;
  const text = scene.on
    ? `${findTheme(scene.themeId).name} · ${findPattern(scene.patternId).name} · ${where} (${count})`
    : `Off · ${where} (${count})`;
  return (
    <p className="preview__caption" data-testid="scene-caption">
      {text}
    </p>
  );
}
