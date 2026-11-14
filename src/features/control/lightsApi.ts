import { useQuery } from '@tanstack/react-query';
import {
  dataClient,
  unwrap,
  type LightRecord,
  type RunnerStatusRecord,
} from '../../lib/dataClient';

const LIGHTS_KEY = ['lights'] as const;
const RUNNER_KEY = ['runner-status'] as const;
const STATUS_ID = 'main';

export async function fetchLights(): Promise<LightRecord[]> {
  const rows: LightRecord[] = [];
  let token: string | null | undefined;
  do {
    const page = await dataClient.models.Light.list({ limit: 500, nextToken: token });
    rows.push(...unwrap(page));
    token = page.nextToken;
  } while (token);
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export function useLights() {
  return useQuery({ queryKey: LIGHTS_KEY, queryFn: fetchLights, staleTime: 60_000 });
}

export async function fetchRunnerStatus(): Promise<RunnerStatusRecord | null> {
  return unwrap(await dataClient.models.RunnerStatus.get({ id: STATUS_ID }));
}

/** Polls so the online/offline chip follows the runner's 30s heartbeat. */
export function useRunnerStatus() {
  return useQuery({
    queryKey: RUNNER_KEY,
    queryFn: fetchRunnerStatus,
    refetchInterval: 30_000,
  });
}
