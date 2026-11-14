import { describe, expect, it } from 'vitest';
import { groupRooms, runnerOnline, targetLabel } from './rooms';

const lights = [
  { roomId: 'R2', roomName: 'Porch' },
  { roomId: 'R1', roomName: 'Living Room' },
  { roomId: 'R1', roomName: 'Living Room' },
  { roomId: null, roomName: null },
];

describe('groupRooms', () => {
  it('counts lights per room, sorted by name, skipping roomless lights', () => {
    expect(groupRooms(lights)).toEqual([
      { id: 'R1', name: 'Living Room', count: 2 },
      { id: 'R2', name: 'Porch', count: 1 },
    ]);
  });
  it('labels a room with a missing name', () => {
    expect(groupRooms([{ roomId: 'X' }])[0].name).toBe('Room');
  });
});

describe('runnerOnline', () => {
  const now = Date.parse('2026-12-01T00:02:00Z');
  it('is online within 90s of the heartbeat', () => {
    expect(runnerOnline('2026-12-01T00:01:00Z', now)).toBe(true);
    expect(runnerOnline('2026-12-01T00:00:00Z', now)).toBe(false);
    expect(runnerOnline(null, now)).toBe(false);
    expect(runnerOnline('garbage', now)).toBe(false);
  });
});

describe('targetLabel', () => {
  const rooms = groupRooms(lights);
  it('names all, a room, or unknown', () => {
    expect(targetLabel('all', rooms)).toBe('All lights');
    expect(targetLabel('R2', rooms)).toBe('Porch');
    expect(targetLabel('nope', rooms)).toBe('Unknown room');
  });
});
