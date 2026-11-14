import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { useOptimisticMutation } from './useOptimisticMutation';

const KEY = ['thing'] as const;

function setup(mutationFn: (v: number) => Promise<void>) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: 0 } } });
  qc.setQueryData<{ n: number }>(KEY, { n: 1 });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  const hook = renderHook(
    () =>
      useOptimisticMutation<number, { n: number }>(KEY, mutationFn, (cur, v) => ({
        n: (cur?.n ?? 0) + v,
      })),
    { wrapper },
  );
  return { qc, hook };
}

describe('useOptimisticMutation', () => {
  it('updates the cache before the network resolves', async () => {
    const { qc, hook } = setup(() => new Promise(() => {}));
    act(() => hook.result.current.mutate(5));
    await waitFor(() => expect(qc.getQueryData(KEY)).toEqual({ n: 6 }));
  });

  it('rolls back to the snapshot when the write fails', async () => {
    const { qc, hook } = setup(() => Promise.reject(new Error('nope')));
    act(() => hook.result.current.mutate(5));
    await waitFor(() => expect(hook.result.current.isError).toBe(true));
    expect(qc.getQueryData(KEY)).toEqual({ n: 1 });
  });

  it('keeps the optimistic value on success (no refetch)', async () => {
    const { qc, hook } = setup(() => Promise.resolve());
    act(() => hook.result.current.mutate(2));
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    expect(qc.getQueryData(KEY)).toEqual({ n: 3 });
  });
});
