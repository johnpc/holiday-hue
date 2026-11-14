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
  const sleep = vi.fn(async () => {});
  const loop = createLoop({
    hue,
    rng: () => 0,
    setTimeout: (fn, ms) => {
      timers.push({ fn, ms });
      return timers.length as never;
    },
    clearTimeout: vi.fn(),
    sleep,
    log,
  });
  loop.setLights(lights);
  return { loop, setLight, timers, log, sleep };
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

  it('spaces writes within a tick and returns the remaining budget', async () => {
    const { loop, setLight, sleep } = make();
    loop.setLights([...lights, { ...lights[0], hueId: 'b' }, { ...lights[0], hueId: 'c' }]);
    loop.setScene(steady);
    const delay = await loop.runTick();
    expect(setLight).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(150);
    expect(delay).toBe(1200 - 3 * 150);
  });

  it('retries a rate-limited write once after a pause', async () => {
    const setLight = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error('hue: HTTP 429 PUT light/a'))
      .mockResolvedValue(undefined);
    const { loop, sleep } = make(setLight);
    loop.setScene(steady);
    await loop.runTick();
    expect(setLight).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(600);
    expect(loop.lastError()).toBeNull();
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

  it('ignores an identical scene (the poll) — no resend, no reschedule', async () => {
    const { loop, setLight, timers } = make();
    loop.setScene(steady);
    await loop.runTick();
    loop.start();
    loop.setScene({ ...steady });
    expect(timers).toHaveLength(1);
    await loop.runTick();
    expect(setLight).toHaveBeenCalledTimes(1);
  });

  it('never runs two ticks at once: a change mid-tick makes the NEXT tick immediate', async () => {
    let release: () => void = () => {};
    const setLight = vi.fn(() => new Promise<void>((r) => (release = r)));
    const { loop, timers } = make(setLight);
    loop.setScene(steady);
    loop.start();
    timers[0].fn(); // tick 1 starts and blocks on the bridge
    await Promise.resolve();
    loop.setScene({ ...steady, brightness: 10 }); // arrives mid-tick
    timers[0].fn(); // a stray second fire must be a no-op while busy
    expect(setLight).toHaveBeenCalledTimes(1);
    release();
    await new Promise((r) => setTimeout(r, 0));
    expect(timers.at(-1)?.ms).toBe(0); // rescheduled immediately for the new scene
    expect(timers).toHaveLength(2);
  });
});
