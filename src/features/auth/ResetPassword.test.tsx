import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const baseForm = () => ({
  phase: 'request' as 'request' | 'confirm',
  email: 'a@b.com',
  setEmail: vi.fn(),
  password: '',
  setPassword: vi.fn(),
  code: '',
  setCode: vi.fn(),
  error: null as string | null,
  busy: false,
  submitEmail: vi.fn(),
  submitNewPassword: vi.fn(),
});
const form = vi.hoisted(() => ({ value: {} as ReturnType<typeof baseForm> }));
vi.mock('./useResetPasswordForm', () => ({ useResetPasswordForm: () => form.value }));

import { ResetPassword } from './ResetPassword';

function renderReset() {
  return render(
    <MemoryRouter>
      <ResetPassword />
    </MemoryRouter>,
  );
}

describe('ResetPassword', () => {
  beforeEach(() => {
    form.value = baseForm();
  });

  it('requests a code in the request phase', () => {
    renderReset();
    fireEvent.change(screen.getByTestId('reset-email'), { target: { value: 'x@y.com' } });
    expect(form.value.setEmail).toHaveBeenCalledWith('x@y.com');
    fireEvent.click(screen.getByTestId('reset-submit'));
    expect(form.value.submitEmail).toHaveBeenCalled();
    expect(screen.getByTestId('reset-signin')).toBeInTheDocument();
  });

  it('collects the code + new password in the confirm phase', () => {
    form.value = { ...baseForm(), phase: 'confirm' };
    renderReset();
    expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('reset-code'), { target: { value: '654321' } });
    fireEvent.change(screen.getByTestId('reset-password'), { target: { value: 'NewPw1!' } });
    expect(form.value.setCode).toHaveBeenCalledWith('654321');
    expect(form.value.setPassword).toHaveBeenCalledWith('NewPw1!');
    fireEvent.click(screen.getByTestId('reset-confirm'));
    expect(form.value.submitNewPassword).toHaveBeenCalled();
  });

  it('shows an error and a busy label', () => {
    form.value = { ...baseForm(), error: 'no such user', busy: true };
    renderReset();
    expect(screen.getByTestId('reset-submit-error')).toHaveTextContent('no such user');
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled();
  });
});
