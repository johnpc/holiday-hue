import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SCENE } from '../src/domain/scene';
import type { HueClient } from './hueClient';
import { createLoop } from './loop';

const lights = [
  {
    hueId: 'a',
    name: 'a',
    roomId: null,
    roomName: null,
    reachable: true,
    supportsColor: true,
    lastSeenAt: 'x',
  },
];
const steady = { ...DEFAULT_SCENE, patternId: 'steady' };

function make(setLight = vi.fn(() => Promise.resolve())) {
  const timers: { fn: () => void; ms: number }[] = [];
  const hue = { setLight } as never as HueClient;
  const log = vi.fn();
  const loop = createLoop({
    hue,
    rng: () => 0,
    setTimeout: (fn, ms) => {
      timers.push({ fn, ms });
      return timers.length as never;
    },
    clearTimeout: vi.fn(),
    log,
  });
  loop.setLights(lights);
  return { loop, setLight, timers, log };
}

describe('createLoop', () => {
  it('idles when no scene is loaded', async () => {
    const { loop, setLight } = make();
    expect(await loop.runTick()).toBe(1000);
    expect(setLight).not.toHaveBeenCalled();
  });

  it('sends the frame once, then nothing for a steady scene', async () => {
    const { loop, setLight } = make();
    loop.setScene(steady);
    await loop.runTick();
    await loop.runTick();
    expect(setLight).toHaveBeenCalledTimes(1);
    expect(setLight).toHaveBeenCalledWith(
      'a',
      expect.objectContaining({ on: true, brightness: 80 }),
    );
  });

  it('resends after a scene change', async () => {
    const { loop, setLight } = make();
    loop.setScene(steady);
    await loop.runTick();
    loop.setScene({ ...steady, brightness: 20 });
    await loop.runTick();
    expect(setLight).toHaveBeenCalledTimes(2);
  });

  it('records bridge errors without crashing', async () => {
    const { loop, log } = make(vi.fn(() => Promise.reject(new Error('boom'))));
    loop.setScene(steady);
    await loop.runTick();
    expect(loop.lastError()).toContain('boom');
    expect(log).toHaveBeenCalled();
  });

  it('start schedules a tick and stop cancels it', () => {
    const { loop, timers } = make();
    loop.start();
    expect(timers).toHaveLength(1);
    loop.setScene(steady);
    expect(timers).toHaveLength(2);
    loop.stop();
    timers[1].fn();
  });
});
