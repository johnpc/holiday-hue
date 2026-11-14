import { lerpColor } from './color';
import { clampBrightness } from './scene';

/** What one light should show on a given tick. */
export interface LightFrame {
  color: string;
  brightness: number;
}

interface FrameInput {
  colors: string[];
  patternId: string;
  lightCount: number;
  /** Monotonic tick counter (the scheduler advances it every tickIntervalMs). */
  tick: number;
  brightness: number;
  /** Injected randomness (0 ≤ rng() < 1) so twinkle is deterministic in tests. */
  rng: () => number;
}

const FADE_STEPS = 8;
const TWINKLE_CHANCE = 0.35;
const TWINKLE_DIM = 0.45;

const paletteAt = (colors: string[], i: number) =>
  colors[((i % colors.length) + colors.length) % colors.length];

function steady({ colors, lightCount, brightness }: FrameInput): LightFrame[] {
  return Array.from({ length: lightCount }, (_, i) => ({
    color: paletteAt(colors, i),
    brightness,
  }));
}

function alternate(input: FrameInput): LightFrame[] {
  const { colors, lightCount, tick, brightness } = input;
  return Array.from({ length: lightCount }, (_, i) => ({
    color: paletteAt(colors, i + tick),
    brightness,
  }));
}

function fade(input: FrameInput): LightFrame[] {
  const { colors, lightCount, tick, brightness } = input;
  const step = Math.floor(tick / FADE_STEPS);
  const t = (tick % FADE_STEPS) / FADE_STEPS;
  return Array.from({ length: lightCount }, (_, i) => ({
    color: lerpColor(paletteAt(colors, i + step), paletteAt(colors, i + step + 1), t),
    brightness,
  }));
}

function twinkle(input: FrameInput): LightFrame[] {
  const { colors, lightCount, brightness, rng } = input;
  const dim = clampBrightness(brightness * TWINKLE_DIM);
  return Array.from({ length: lightCount }, (_, i) => ({
    color: paletteAt(colors, i),
    brightness: rng() < TWINKLE_CHANCE ? brightness : dim,
  }));
}

const RENDERERS: Record<string, (input: FrameInput) => LightFrame[]> = {
  steady,
  alternate,
  fade,
  twinkle,
};

/** Pure: the per-light colors/brightness for a tick. Unknown pattern → steady. */
export function renderFrame(input: FrameInput): LightFrame[] {
  if (input.lightCount <= 0 || input.colors.length === 0) return [];
  const render = RENDERERS[input.patternId] ?? steady;
  return render({ ...input, brightness: clampBrightness(input.brightness) });
}
