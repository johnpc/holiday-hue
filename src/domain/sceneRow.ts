import { isHexColor } from './color';
import { clampBrightness, clampSpeed, DEFAULT_SCENE, type SceneState } from './scene';

/** The Scene row's fields as stored (a structural subset of the Amplify model). */
interface SceneRow {
  powerOn: boolean;
  themeId: string;
  patternId: string;
  speed: number;
  brightness: number;
  customColor?: string | null;
  target: string;
}

/** Pure: a stored row → validated runtime state (clamps + defaults). */
export function toSceneState(row: SceneRow | null | undefined): SceneState {
  if (!row) return DEFAULT_SCENE;
  return {
    on: row.powerOn,
    themeId: row.themeId,
    patternId: row.patternId,
    speed: clampSpeed(row.speed),
    brightness: clampBrightness(row.brightness),
    customColor: isHexColor(row.customColor) ? row.customColor : DEFAULT_SCENE.customColor,
    target: row.target || DEFAULT_SCENE.target,
  };
}

/** Pure: runtime state → the row fields to write. */
export function toSceneRow(state: SceneState): SceneRow {
  const { on, ...rest } = state;
  return { powerOn: on, ...rest };
}
