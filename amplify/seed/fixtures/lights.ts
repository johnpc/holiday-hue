/** Fake bridge inventory for sandboxes (prod inventory is written by the runner). */
export const LIGHTS = [
  {
    hueId: 'seed-lr-1',
    name: 'Tree',
    roomId: 'seed-living',
    roomName: 'Living Room',
    supportsColor: true,
  },
  {
    hueId: 'seed-lr-2',
    name: 'Mantel Left',
    roomId: 'seed-living',
    roomName: 'Living Room',
    supportsColor: true,
  },
  {
    hueId: 'seed-lr-3',
    name: 'Mantel Right',
    roomId: 'seed-living',
    roomName: 'Living Room',
    supportsColor: true,
  },
  {
    hueId: 'seed-lr-4',
    name: 'Window',
    roomId: 'seed-living',
    roomName: 'Living Room',
    supportsColor: true,
  },
  {
    hueId: 'seed-porch-1',
    name: 'Porch Left',
    roomId: 'seed-porch',
    roomName: 'Porch',
    supportsColor: true,
  },
  {
    hueId: 'seed-porch-2',
    name: 'Porch Right',
    roomId: 'seed-porch',
    roomName: 'Porch',
    supportsColor: false,
  },
];

/** A heartbeat deliberately in the past so sandboxes read "Runner offline". */
export const STALE_HEARTBEAT = '2026-01-01T00:00:00.000Z';
