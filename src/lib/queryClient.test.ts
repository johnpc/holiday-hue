import { describe, expect, it, vi } from 'vitest';

const toast = vi.hoisted(() => ({ showToast: vi.fn() }));
vi.mock('../features/shell/toastBus', () => toast);

import { queryClient } from './queryClient';

describe('queryClient', () => {
  it('toasts on any mutation error', () => {
    const onError = queryClient.getMutationCache().config.onError;
    if (!onError) throw new Error('no onError');
    const args = [new Error('x'), undefined, undefined, {}, {}] as never as Parameters<
      typeof onError
    >;
    onError(...args);
    expect(toast.showToast).toHaveBeenCalledWith(expect.stringContaining('Something went wrong'));
  });
});
