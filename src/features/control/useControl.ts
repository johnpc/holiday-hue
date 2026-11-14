import { DEFAULT_SCENE, type SceneState } from '../../domain/scene';
import { type ScenePatch, useScene, useUpdateScene } from './sceneApi';
import { useSceneLive } from './useSceneLive';

interface ControlState {
  scene: SceneState;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  /** Apply a change: optimistic cache write, then the network. */
  set: (patch: ScenePatch) => void;
}

/** All control-screen logic: the scene read, live updates, and the writer. */
export function useControl(): ControlState {
  const query = useScene();
  const update = useUpdateScene();
  useSceneLive();
  return {
    scene: query.data ?? DEFAULT_SCENE,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
    set: (patch) => update.mutate(patch),
  };
}
