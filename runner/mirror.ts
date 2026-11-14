import type { RunnerData } from './dataClient';
import type { LightInventory } from './inventory';
import { unwrapData } from './unwrap';

const STATUS_ID = 'main';

interface Heartbeat {
  bridgeReachable: boolean;
  lightCount: number;
  message: string | null;
  version: string;
}

/** Upsert the RunnerStatus heartbeat row (id 'main'). */
export async function writeHeartbeat(data: RunnerData, hb: Heartbeat, now: Date): Promise<void> {
  const fields = { ...hb, lastHeartbeatAt: now.toISOString() };
  const existing = unwrapData(await data.models.RunnerStatus.get({ id: STATUS_ID }));
  if (existing) unwrapData(await data.models.RunnerStatus.update({ id: STATUS_ID, ...fields }));
  else unwrapData(await data.models.RunnerStatus.create({ id: STATUS_ID, ...fields }));
}

/** Mirror the bridge's lights into the Light model: upsert by hueId, delete gone. */
export async function mirrorInventory(
  data: RunnerData,
  inventory: LightInventory[],
): Promise<void> {
  const existing = unwrapData(await data.models.Light.list({ limit: 1000 }));
  const byHueId = new Map(existing.map((row) => [row.hueId, row.id]));
  const seen = new Set<string>();
  for (const light of inventory) {
    seen.add(light.hueId);
    const id = byHueId.get(light.hueId);
    if (id) unwrapData(await data.models.Light.update({ id, ...light }));
    else unwrapData(await data.models.Light.create(light));
  }
  for (const row of existing) {
    if (!seen.has(row.hueId)) unwrapData(await data.models.Light.delete({ id: row.id }));
  }
}
