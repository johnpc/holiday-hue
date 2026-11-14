/** Pure helpers over the light inventory and runner heartbeat. */
interface RoomSummary {
  id: string;
  name: string;
  count: number;
}

interface LightLike {
  roomId?: string | null;
  roomName?: string | null;
}

/** Rooms present in the inventory with their light counts, by name. */
export function groupRooms(lights: LightLike[]): RoomSummary[] {
  const byId = new Map<string, RoomSummary>();
  for (const l of lights) {
    if (!l.roomId) continue;
    const room = byId.get(l.roomId) ?? { id: l.roomId, name: l.roomName ?? 'Room', count: 0 };
    room.count += 1;
    byId.set(l.roomId, room);
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Heartbeats are 30s apart; allow three misses before calling it offline. */
const ONLINE_WINDOW_MS = 90_000;

export function runnerOnline(lastHeartbeatAt: string | null | undefined, now: number): boolean {
  if (!lastHeartbeatAt) return false;
  const at = Date.parse(lastHeartbeatAt);
  return Number.isFinite(at) && now - at < ONLINE_WINDOW_MS;
}

/** Human label for the scene target. */
export function targetLabel(target: string, rooms: RoomSummary[]): string {
  if (target === 'all') return 'All lights';
  return rooms.find((r) => r.id === target)?.name ?? 'Unknown room';
}
