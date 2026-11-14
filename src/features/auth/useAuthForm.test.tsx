import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const signIn = vi.hoisted(() => vi.fn());
const replace = vi.hoisted(() => vi.fn());
vi.mock('./useAuth', () => ({ useAuth: () => ({ signIn }) }));
vi.mock('react-router-dom', () => ({ useHistory: () => ({ replace }) }));

import { useAuthForm } from './useAuthForm';

describe('useAuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('finish signs in with the fields and routes into the app', async () => {
    signIn.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuthForm());
    act(() => {
      result.current.setEmail('a@b.com');
      result.current.setPassword('pw');
    });
    await act(async () => result.current.finish());
    expect(signIn).toHaveBeenCalledWith('a@b.com', 'pw');
    expect(replace).toHaveBeenCalledWith('/lights');
  });

  it('run clears the error, flags busy, and surfaces an Error message', async () => {
    const { result } = renderHook(() => useAuthForm());
    await act(async () => result.current.run(() => Promise.reject(new Error('bad')), 'fallback'));
    await waitFor(() => expect(result.current.error).toBe('bad'));
    expect(result.current.busy).toBe(false);
    await act(async () => result.current.run(() => Promise.resolve(), 'fallback'));
    expect(result.current.error).toBeNull();
  });

  it('run uses the fallback message for a non-Error throw', async () => {
    const { result } = renderHook(() => useAuthForm());
    await act(async () => result.current.run(() => Promise.reject('boom'), 'fallback'));
    await waitFor(() => expect(result.current.error).toBe('fallback'));
  });
});
