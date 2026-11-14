import { describe, expect, it } from 'vitest';
import { DEFAULT_SCENE } from '../src/domain/scene';
import { planTick } from './animator';
import type { LightInventory } from './inventory';

const light = (hueId: string, roomId: string, supportsColor = true): LightInventory => ({
  hueId,
  name: hueId,
  roomId,
  roomName: 'Room',
  reachable: true,
  supportsColor,
  lastSeenAt: 'now',
});
const lights = [light('a', 'R1'), light('b', 'R1', false), light('c', 'R2')];
const steady = { ...DEFAULT_SCENE, patternId: 'steady', themeId: 'candy-cane', speed: 5 };
const rng = () => 0;

describe('planTick', () => {
  it('sends every targeted light on the first tick, color only where supported', () => {
    const plan = planTick({ scene: steady, lights, tick: 0, rng, prev: new Map() });
    expect(plan.commands.map((c) => c.hueId)).toEqual(['a', 'b', 'c']);
    expect(plan.commands[0].cmd.xy).toBeDefined();
    expect(plan.commands[1].cmd.xy).toBeUndefined();
    expect(plan.commands[0].cmd).toMatchObject({ on: true, brightness: 80, durationMs: 720 });
    expect(plan.nextDelayMs).toBe(1200);
  });

  it('sends nothing when the frame did not change (steady)', () => {
    const first = planTick({ scene: steady, lights, tick: 0, rng, prev: new Map() });
    const second = planTick({ scene: steady, lights, tick: 1, rng, prev: first.frame });
    expect(second.commands).toEqual([]);
    expect(second.nextDelayMs).toBe(1200);
  });

  it('respects the room target', () => {
    const plan = planTick({
      scene: { ...steady, target: 'R2' },
      lights,
      tick: 0,
      rng,
      prev: new Map(),
    });
    expect(plan.commands.map((c) => c.hueId)).toEqual(['c']);
  });

  it('turns lights off once when the scene is off', () => {
    const first = planTick({
      scene: { ...steady, on: false },
      lights,
      tick: 0,
      rng,
      prev: new Map(),
    });
    expect(first.commands.every((c) => c.cmd.on === false)).toBe(true);
    const second = planTick({
      scene: { ...steady, on: false },
      lights,
      tick: 1,
      rng,
      prev: first.frame,
    });
    expect(second.commands).toEqual([]);
  });

  it('paces fast patterns to the bridge rate limit', () => {
    const many = Array.from({ length: 30 }, (_, i) => light(`l${i}`, 'R1'));
    const fast = { ...steady, patternId: 'alternate', speed: 10 };
    const plan = planTick({ scene: fast, lights: many, tick: 0, rng, prev: new Map() });
    expect(plan.commands).toHaveLength(30);
    expect(plan.nextDelayMs).toBe(3300);
  });
});
