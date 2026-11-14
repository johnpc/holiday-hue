import { describe, expect, it } from 'vitest';
import { renderFrame } from './frame';

const rngAlways = (v: number) => () => v;
const base = { colors: ['#ff0000', '#00ff00'], lightCount: 4, tick: 0, brightness: 80 };

describe('renderFrame', () => {
  it('returns nothing for no lights or no colors', () => {
    expect(renderFrame({ ...base, patternId: 'steady', lightCount: 0, rng: rngAlways(0) })).toEqual(
      [],
    );
    expect(renderFrame({ ...base, patternId: 'steady', colors: [], rng: rngAlways(0) })).toEqual(
      [],
    );
  });

  it('steady spreads the palette across lights and ignores the tick', () => {
    const a = renderFrame({ ...base, patternId: 'steady', rng: rngAlways(0) });
    const b = renderFrame({ ...base, patternId: 'steady', tick: 7, rng: rngAlways(0) });
    expect(a.map((f) => f.color)).toEqual(['#ff0000', '#00ff00', '#ff0000', '#00ff00']);
    expect(a).toEqual(b);
    expect(a.every((f) => f.brightness === 80)).toBe(true);
  });

  it('alternate shifts the palette by one each tick', () => {
    const t0 = renderFrame({ ...base, patternId: 'alternate', rng: rngAlways(0) });
    const t1 = renderFrame({ ...base, patternId: 'alternate', tick: 1, rng: rngAlways(0) });
    expect(t0[0].color).toBe('#ff0000');
    expect(t1[0].color).toBe('#00ff00');
  });

  it('fade blends toward the next color between steps', () => {
    const mid = renderFrame({ ...base, patternId: 'fade', tick: 4, rng: rngAlways(0) });
    expect(mid[0].color).toBe('#808000');
    const onStep = renderFrame({ ...base, patternId: 'fade', tick: 8, rng: rngAlways(0) });
    expect(onStep[0].color).toBe('#00ff00');
  });

  it('twinkle sparkles lights the rng picks and dims the rest', () => {
    const bright = renderFrame({ ...base, patternId: 'twinkle', rng: rngAlways(0) });
    const dimmed = renderFrame({ ...base, patternId: 'twinkle', rng: rngAlways(0.99) });
    expect(bright.every((f) => f.brightness === 80)).toBe(true);
    expect(dimmed.every((f) => f.brightness === 36)).toBe(true);
    expect(dimmed[1].color).toBe('#00ff00');
  });

  it('falls back to steady for an unknown pattern and clamps brightness', () => {
    const f = renderFrame({ ...base, patternId: 'nope', brightness: 400, rng: rngAlways(0) });
    expect(f[0]).toEqual({ color: '#ff0000', brightness: 100 });
  });
});
