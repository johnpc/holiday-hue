import type { JsonTransport } from './https';

/** The CLIP v2 fields we read (https://developers.meethue.com/develop/hue-api-v2/). */
export interface ClipLight {
  id: string;
  owner: { rid: string; rtype: string };
  metadata: { name: string };
  on: { on: boolean };
  color?: { xy: { x: number; y: number } };
}
export interface ClipRoom {
  id: string;
  metadata: { name: string };
  children: { rid: string; rtype: string }[];
}
export interface LightCommand {
  on: boolean;
  xy?: { x: number; y: number };
  /** 1 … 100 */
  brightness?: number;
  durationMs?: number;
}

export interface HueClient {
  listLights(): Promise<ClipLight[]>;
  listRooms(): Promise<ClipRoom[]>;
  setLight(id: string, cmd: LightCommand): Promise<void>;
}

/** Pure: the CLIP v2 PUT body for a command. */
export function toClipBody(cmd: LightCommand): string {
  const body: Record<string, object> = { on: { on: cmd.on } };
  if (cmd.on && cmd.xy) body.color = { xy: cmd.xy };
  if (cmd.on && cmd.brightness !== undefined) body.dimming = { brightness: cmd.brightness };
  if (cmd.durationMs !== undefined) body.dynamics = { duration: cmd.durationMs };
  return JSON.stringify(body);
}

export function createHueClient(ip: string, appKey: string, transport: JsonTransport): HueClient {
  const headers = { 'hue-application-key': appKey, 'Content-Type': 'application/json' };
  const base = `https://${ip}/clip/v2/resource`;
  const list = async <T>(kind: string): Promise<T[]> => {
    const raw = await transport({ method: 'GET', url: `${base}/${kind}`, headers });
    return parseData<T>(raw);
  };
  return {
    listLights: () => list<ClipLight>('light'),
    listRooms: () => list<ClipRoom>('room'),
    async setLight(id, cmd) {
      await transport({
        method: 'PUT',
        url: `${base}/light/${id}`,
        headers,
        body: toClipBody(cmd),
      });
    },
  };
}

/** The single typed boundary over the bridge's JSON: `{ data: T[] }`. */
function parseData<T>(raw: string): T[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed = JSON.parse(raw) as any;
  return Array.isArray(parsed?.data) ? (parsed.data as T[]) : [];
}
