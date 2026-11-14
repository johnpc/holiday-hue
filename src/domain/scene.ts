import { DEFAULT_PATTERN_ID } from './patterns';
import { DEFAULT_THEME_ID } from './themes';

/** The one desired state the phone writes and the runner follows. */
export interface SceneState {
  on: boolean;
  themeId: string;
  patternId: string;
  /** 1 (slow) … 10 (fast) */
  speed: number;
  /** 1 … 100 percent */
  brightness: number;
  /** #rrggbb for the 'solid' theme */
  customColor: string | null;
  /** 'all' or a Hue room/zone id */
  target: string;
}

export const ALL_LIGHTS = 'all';
export const MIN_SPEED = 1;
export const MAX_SPEED = 10;
export const MIN_BRIGHTNESS = 1;
export const MAX_BRIGHTNESS = 100;

export const DEFAULT_SCENE: SceneState = {
  on: true,
  themeId: DEFAULT_THEME_ID,
  patternId: DEFAULT_PATTERN_ID,
  speed: 5,
  brightness: 80,
  customColor: '#ff1a1a',
  target: ALL_LIGHTS,
};

const clampInt = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n)));

export const clampSpeed = (n: number) => clampInt(n, MIN_SPEED, MAX_SPEED);
export const clampBrightness = (n: number) => clampInt(n, MIN_BRIGHTNESS, MAX_BRIGHTNESS);

/** Milliseconds between animation ticks for a speed: 1 → 2000ms … 10 → 200ms. */
export function tickIntervalMs(speed: number): number {
  return 2200 - clampSpeed(speed) * 200;
}
