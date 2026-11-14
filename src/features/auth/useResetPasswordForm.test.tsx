import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const resetPassword = vi.hoisted(() => vi.fn());
const confirmResetPassword = vi.hoisted(() => vi.fn());
const signIn = vi.hoisted(() => vi.fn());
const replace = vi.hoisted(() => vi.fn());
vi.mock('./useAuth', () => ({
  useAuth: () => ({ resetPassword, confirmResetPassword, signIn }),
}));
vi.mock('react-router-dom', () => ({ useHistory: () => ({ replace }) }));

import { useResetPasswordForm } from './useResetPasswordForm';

describe('useResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signIn.mockResolvedValue(undefined);
  });

  it('requests a code then moves to the confirm phase', async () => {
    resetPassword.mockResolvedValue(undefined);
    const { result } = renderHook(() => useResetPasswordForm());
    act(() => result.current.setEmail('a@b.com'));
    await act(async () => result.current.submitEmail());
    await waitFor(() => expect(result.current.phase).toBe('confirm'));
    expect(resetPassword).toHaveBeenCalledWith('a@b.com');
  });

  it('confirms with code + new password, then signs the user in', async () => {
    confirmResetPassword.mockResolvedValue(undefined);
    const { result } = renderHook(() => useResetPasswordForm());
    act(() => {
      result.current.setEmail('a@b.com');
      result.current.setCode('654321');
      result.current.setPassword('NewPw1!');
    });
    await act(async () => result.current.submitNewPassword());
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/lights'));
    expect(confirmResetPassword).toHaveBeenCalledWith('a@b.com', '654321', 'NewPw1!');
    expect(signIn).toHaveBeenCalledWith('a@b.com', 'NewPw1!');
  });

  it('surfaces errors from both phases', async () => {
    resetPassword.mockRejectedValue(new Error('no such user'));
    confirmResetPassword.mockRejectedValue('boom');
    const { result } = renderHook(() => useResetPasswordForm());
    await act(async () => result.current.submitEmail());
    await waitFor(() => expect(result.current.error).toBe('no such user'));
    expect(result.current.phase).toBe('request');
    await act(async () => result.current.submitNewPassword());
    await waitFor(() => expect(result.current.error).toBe('Reset failed.'));
  });
});
