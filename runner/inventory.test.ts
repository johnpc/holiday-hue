import { describe, expect, it } from 'vitest';
import { buildInventory, selectTargets } from './inventory';

const lights = [
  {
    id: 'L2',
    owner: { rid: 'D2', rtype: 'device' },
    metadata: { name: 'Tree' },
    on: { on: true },
    color: { xy: { x: 0.5, y: 0.4 } },
  },
  {
    id: 'L1',
    owner: { rid: 'D1', rtype: 'device' },
    metadata: { name: 'Lamp' },
    on: { on: false },
  },
  {
    id: 'L3',
    owner: { rid: 'D3', rtype: 'device' },
    metadata: { name: 'Porch' },
    on: { on: false },
  },
];
const rooms = [
  {
    id: 'R1',
    metadata: { name: 'Living Room' },
    children: [
      { rid: 'D1', rtype: 'device' },
      { rid: 'D2', rtype: 'device' },
      { rid: 'X', rtype: 'other' },
    ],
  },
];
const now = new Date('2026-12-01T00:00:00Z');

describe('buildInventory', () => {
  it('joins lights to rooms via devices, sorted by name', () => {
    const inv = buildInventory(lights, rooms, now);
    expect(inv.map((l) => l.name)).toEqual(['Lamp', 'Porch', 'Tree']);
    expect(inv[0]).toEqual({
      hueId: 'L1',
      name: 'Lamp',
      roomId: 'R1',
      roomName: 'Living Room',
      reachable: true,
      supportsColor: false,
      lastSeenAt: '2026-12-01T00:00:00.000Z',
    });
    expect(inv[2].supportsColor).toBe(true);
    expect(inv[1].roomId).toBeNull();
  });
});

describe('selectTargets', () => {
  const inv = buildInventory(lights, rooms, now);
  it('returns everything for all, else the room', () => {
    expect(selectTargets(inv, 'all')).toHaveLength(3);
    expect(selectTargets(inv, 'R1').map((l) => l.hueId)).toEqual(['L1', 'L2']);
    expect(selectTargets(inv, 'R9')).toEqual([]);
  });
});
