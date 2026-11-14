import { hexToXy } from '../src/domain/color';
import { renderFrame, type LightFrame } from '../src/domain/frame';
import { type SceneState, tickIntervalMs } from '../src/domain/scene';
import { themeColors } from '../src/domain/themes';
import type { LightCommand } from './hueClient';
import { selectTargets, type LightInventory } from './inventory';

export interface Plan {
  /** hueId → command, only for lights whose state changed since `prev`. */
  commands: { hueId: string; cmd: LightCommand }[];
  /** The frame to remember as `prev` for the next tick. */
  frame: Map<string, LightFrame | 'off'>;
  /** Pace the next tick so the bridge sees ≤ ~9 light commands per second. */
  nextDelayMs: number;
}

/** Bridge rate limit: ~10 light PUTs/sec; other apps (Home Assistant) share it,
 * so we leave real headroom. */
export const MS_PER_COMMAND = 150;
/** Smooth each change over most of the interval so twinkles ramp, not snap. */
const TRANSITION_RATIO = 0.6;
const MAX_TRANSITION_MS = 1500;

interface PlanInput {
  scene: SceneState;
  lights: LightInventory[];
  tick: number;
  rng: () => number;
  prev: Map<string, LightFrame | 'off'>;
}

/** Pure: given the scene and the last frame, decide what to send this tick. */
export function planTick({ scene, lights, tick, rng, prev }: PlanInput): Plan {
  const targets = selectTargets(lights, scene.target);
  const interval = tickIntervalMs(scene.speed);
  const duration = Math.min(MAX_TRANSITION_MS, Math.round(interval * TRANSITION_RATIO));
  const frame = new Map<string, LightFrame | 'off'>();
  const commands: Plan['commands'] = [];

  const frames = scene.on
    ? renderFrame({
        colors: themeColors(scene.themeId, scene.customColor),
        patternId: scene.patternId,
        lightCount: targets.length,
        tick,
        brightness: scene.brightness,
        rng,
      })
    : [];

  targets.forEach((light, i) => {
    const next: LightFrame | 'off' = scene.on ? frames[i] : 'off';
    frame.set(light.hueId, next);
    if (sameState(prev.get(light.hueId), next)) return;
    commands.push({ hueId: light.hueId, cmd: toCommand(next, light.supportsColor, duration) });
  });

  return { commands, frame, nextDelayMs: Math.max(interval, commands.length * MS_PER_COMMAND) };
}

function sameState(a: LightFrame | 'off' | undefined, b: LightFrame | 'off'): boolean {
  if (a === undefined) return false;
  if (a === 'off' || b === 'off') return a === b;
  return a.color === b.color && a.brightness === b.brightness;
}

function toCommand(
  f: LightFrame | 'off',
  supportsColor: boolean,
  durationMs: number,
): LightCommand {
  if (f === 'off') return { on: false, durationMs };
  return {
    on: true,
    brightness: f.brightness,
    durationMs,
    ...(supportsColor ? { xy: hexToXy(f.color) } : {}),
  };
}
