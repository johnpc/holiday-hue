import type { SceneState } from '../src/domain/scene';
import { toSceneState } from '../src/domain/sceneRow';
import { unwrapData } from './unwrap';
import type { RunnerData } from './dataClient';

const SCENE_ID = 'main';

export async function loadScene(data: RunnerData): Promise<SceneState> {
  const row = unwrapData(await data.models.Scene.get({ id: SCENE_ID }));
  return toSceneState(row);
}

/** Live updates: resolves an unsubscribe. Falls back silently if the socket
 * can't open — the poll in the loop is the backstop. */
export function subscribeScene(data: RunnerData, onScene: (s: SceneState) => void): () => void {
  const subs = [data.models.Scene.onUpdate(), data.models.Scene.onCreate()].map((obs) =>
    obs.subscribe({
      next: (row) => {
        if (row.id === SCENE_ID) onScene(toSceneState(row));
      },
      error: (err) => console.warn('scene subscription error (polling continues)', err),
    }),
  );
  return () => subs.forEach((s) => s.unsubscribe());
}
