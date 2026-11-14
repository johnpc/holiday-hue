import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

type Handlers = {
  next: (row: { id: string; [k: string]: string | number | boolean | null }) => void;
  error: () => void;
};
const sub = vi.hoisted(() => ({ handlers: null as Handlers | null, unsubscribe: vi.fn() }));
vi.mock('../../lib/dataClient', () => ({
  dataClient: {
    models: {
      Scene: {
        onUpdate: () => ({
          subscribe: (h: Handlers) => {
            sub.handlers = h;
            return { unsubscribe: sub.unsubscribe };
          },
        }),
      },
    },
  },
}));

import { SCENE_KEY } from './sceneApi';
import { useSceneLive } from './useSceneLive';

describe('useSceneLive', () => {
  it('writes incoming scene updates into the cache and unsubscribes on unmount', () => {
    const qc = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );
    const { unmount } = renderHook(() => useSceneLive(), { wrapper });
    sub.handlers!.next({
      id: 'other',
      powerOn: true,
      themeId: 'x',
      patternId: 'y',
      speed: 1,
      brightness: 1,
      target: 'all',
      customColor: null,
    });
    expect(qc.getQueryData(SCENE_KEY)).toBeUndefined();
    sub.handlers!.next({
      id: 'main',
      powerOn: false,
      themeId: 'white',
      patternId: 'steady',
      speed: 2,
      brightness: 30,
      target: 'all',
      customColor: null,
    });
    expect(qc.getQueryData(SCENE_KEY)).toMatchObject({ on: false, themeId: 'white' });
    sub.handlers!.error();
    unmount();
    expect(sub.unsubscribe).toHaveBeenCalled();
  });
});
