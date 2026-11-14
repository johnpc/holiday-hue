import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { dataClient } from '../../lib/dataClient';
import { toSceneState } from '../../domain/sceneRow';
import { SCENE_ID, SCENE_KEY } from './sceneApi';

/** Keep the scene cache in step with other phones (and the runner) via the
 * AppSync subscription. Reconciliation lives here, never in a post-write refetch. */
export function useSceneLive(): void {
  const qc = useQueryClient();
  useEffect(() => {
    const sub = dataClient.models.Scene.onUpdate().subscribe({
      next: (row) => {
        if (row.id === SCENE_ID) qc.setQueryData(SCENE_KEY, toSceneState(row));
      },
      error: () => {
        /* the focus refetch is the backstop */
      },
    });
    return () => sub.unsubscribe();
  }, [qc]);
}
