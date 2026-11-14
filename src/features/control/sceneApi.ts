import { useQuery } from '@tanstack/react-query';
import { dataClient, unwrap } from '../../lib/dataClient';
import { useOptimisticMutation } from '../../lib/useOptimisticMutation';
import { DEFAULT_SCENE, type SceneState } from '../../domain/scene';
import { toSceneRow, toSceneState } from '../../domain/sceneRow';

export const SCENE_ID = 'main';
export const SCENE_KEY = ['scene'] as const;

/** Read the one Scene row, creating it with defaults on a fresh backend. */
export async function fetchScene(): Promise<SceneState> {
  const row = unwrap(await dataClient.models.Scene.get({ id: SCENE_ID }));
  if (row) return toSceneState(row);
  const created = unwrap(
    await dataClient.models.Scene.create({ id: SCENE_ID, ...toSceneRow(DEFAULT_SCENE) }),
  );
  return toSceneState(created);
}

export function useScene() {
  return useQuery({ queryKey: SCENE_KEY, queryFn: fetchScene, staleTime: 10_000 });
}

export type ScenePatch = Partial<SceneState>;

/** Write a partial scene change; the cache updates at press time and rolls
 * back on failure (no refetch — the subscription reconciles). */
export async function writeScene(patch: ScenePatch): Promise<void> {
  const { on, ...rest } = patch;
  const fields = on === undefined ? rest : { powerOn: on, ...rest };
  unwrap(await dataClient.models.Scene.update({ id: SCENE_ID, ...fields }));
}

export function useUpdateScene() {
  return useOptimisticMutation<ScenePatch, SceneState>(SCENE_KEY, writeScene, (cur, patch) => ({
    ...(cur ?? DEFAULT_SCENE),
    ...patch,
  }));
}
