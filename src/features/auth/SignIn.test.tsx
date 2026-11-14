import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const baseForm = () => ({
  email: '',
  setEmail: vi.fn(),
  password: '',
  setPassword: vi.fn(),
  error: null as string | null,
  busy: false,
  submit: vi.fn(),
});
const form = vi.hoisted(() => ({ value: {} as ReturnType<typeof baseForm> }));
vi.mock('./useSignInForm', () => ({ useSignInForm: () => form.value }));

import { SignIn } from './SignIn';

function renderSignIn() {
  return render(
    <MemoryRouter>
      <SignIn />
    </MemoryRouter>,
  );
}

describe('SignIn', () => {
  beforeEach(() => {
    form.value = baseForm();
  });

  it('submits the form on the CTA click and types into the fields', () => {
    renderSignIn();
    fireEvent.change(screen.getByTestId('signin-email'), { target: { value: 'a@b.com' } });
    expect(form.value.setEmail).toHaveBeenCalledWith('a@b.com');
    fireEvent.click(screen.getByTestId('signin-submit'));
    expect(form.value.submit).toHaveBeenCalled();
  });

  it('links to forgot-password and sign-up', () => {
    renderSignIn();
    expect(screen.getByTestId('signin-forgot')).toBeInTheDocument();
    expect(screen.getByTestId('signin-signup')).toBeInTheDocument();
    expect(screen.getByText('Holiday Hue')).toBeInTheDocument();
  });

  it('shows an error and a busy label', () => {
    form.value = { ...baseForm(), error: 'nope', busy: true };
    renderSignIn();
    expect(screen.getByTestId('signin-submit-error')).toHaveTextContent('nope');
    expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled();
  });
});
