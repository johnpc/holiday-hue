import type { ClipLight, ClipRoom } from './hueClient';

/** What the runner mirrors into the Light model for the app to display. */
export interface LightInventory {
  hueId: string;
  name: string;
  roomId: string | null;
  roomName: string | null;
  reachable: boolean;
  supportsColor: boolean;
  lastSeenAt: string;
}

/**
 * Pure: joins CLIP lights → room. A room's children are DEVICES and a light's
 * `owner` is its device, so the join key is the device id. Lights without a
 * room get null room fields.
 */
export function buildInventory(
  lights: ClipLight[],
  rooms: ClipRoom[],
  now: Date,
): LightInventory[] {
  const roomByDevice = new Map<string, ClipRoom>();
  for (const room of rooms) {
    for (const child of room.children)
      if (child.rtype === 'device') roomByDevice.set(child.rid, room);
  }
  const iso = now.toISOString();
  return lights
    .map((light) => {
      const room = roomByDevice.get(light.owner.rid);
      return {
        hueId: light.id,
        name: light.metadata.name,
        roomId: room?.id ?? null,
        roomName: room?.metadata.name ?? null,
        reachable: true,
        supportsColor: light.color !== undefined,
        lastSeenAt: iso,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Pure: the lights a scene target selects ('all' or a room id). */
export function selectTargets<T extends { roomId: string | null }>(
  lights: T[],
  target: string,
): T[] {
  return target === 'all' ? lights : lights.filter((l) => l.roomId === target);
}
