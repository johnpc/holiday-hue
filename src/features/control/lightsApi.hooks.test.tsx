import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/dataClient', async () => {
  const actual =
    await vi.importActual<typeof import('../../lib/dataClient')>('../../lib/dataClient');
  return {
    ...actual,
    dataClient: {
      models: {
        Light: { list: async () => ({ data: [{ name: 'Tree' }], nextToken: null }) },
        RunnerStatus: { get: async () => ({ data: { id: 'main', lastHeartbeatAt: 'x' } }) },
      },
    },
  };
});

import { useLights, useRunnerStatus } from './lightsApi';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('lights hooks', () => {
  it('useLights resolves the inventory', async () => {
    const { result } = renderHook(() => useLights(), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
  });
  it('useRunnerStatus resolves the heartbeat', async () => {
    const { result } = renderHook(() => useRunnerStatus(), { wrapper });
    await waitFor(() => expect(result.current.data?.id).toBe('main'));
  });
});
