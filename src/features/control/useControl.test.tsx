import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SCENE } from '../../domain/scene';

const models = vi.hoisted(() => ({
  Scene: {
    get: vi.fn(async () => ({
      data: {
        id: 'main',
        powerOn: true,
        themeId: 'rainbow',
        patternId: 'twinkle',
        speed: 5,
        brightness: 80,
        target: 'all',
      },
    })),
    update: vi.fn(async () => ({ data: {} })),
  },
}));
vi.mock('../../lib/dataClient', async () => {
  const actual =
    await vi.importActual<typeof import('../../lib/dataClient')>('../../lib/dataClient');
  return { ...actual, dataClient: { models } };
});
vi.mock('./useSceneLive', () => ({ useSceneLive: () => {} }));

import { useControl } from './useControl';

describe('useControl', () => {
  it('loads the scene and applies patches optimistically', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useControl(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.scene).toEqual(DEFAULT_SCENE);
    await waitFor(() => expect(result.current.scene.themeId).toBe('rainbow'));
    act(() => result.current.set({ speed: 9 }));
    await waitFor(() => expect(result.current.scene.speed).toBe(9));
    act(() => result.current.refetch());
  });
});
