import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const client = vi.hoisted(() => ({
  currentEmail: vi.fn(),
  currentGroups: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  confirmSignUp: vi.fn(),
  resetPassword: vi.fn(),
  confirmResetPassword: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock('./authClient', () => client);

import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';

function Probe() {
  const a = useAuth();
  return (
    <div>
      <span data-testid="status">{a.status}</span>
      <span data-testid="email">{a.email ?? 'none'}</span>
      <span data-testid="groups">{a.groups.join(',')}</span>
      <button onClick={() => a.signIn('a@b.com', 'pw')}>signin</button>
      <button onClick={() => a.signUp('a@b.com', 'pw')}>signup</button>
      <button onClick={() => a.confirmSignUp('a@b.com', '123456')}>confirm</button>
      <button onClick={() => a.resetPassword('a@b.com')}>reset</button>
      <button onClick={() => a.confirmResetPassword('a@b.com', '1', 'pw2')}>confirmreset</button>
      <button onClick={() => a.signOut()}>signout</button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
const status = () => screen.getByTestId('status');

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client.currentGroups.mockResolvedValue(['editors']);
  });

  it('resolves to unauthenticated when no session (and skips the group lookup)', async () => {
    client.currentEmail.mockResolvedValue(null);
    renderProbe();
    await waitFor(() => expect(status()).toHaveTextContent('unauthenticated'));
    expect(client.currentGroups).not.toHaveBeenCalled();
  });

  it('resolves to authenticated and exposes the email + groups', async () => {
    client.currentEmail.mockResolvedValue('a@b.com');
    renderProbe();
    await waitFor(() => expect(status()).toHaveTextContent('authenticated'));
    expect(screen.getByTestId('email')).toHaveTextContent('a@b.com');
    expect(screen.getByTestId('groups')).toHaveTextContent('editors');
  });

  it('signIn refreshes session state', async () => {
    client.currentEmail.mockResolvedValueOnce(null).mockResolvedValue('a@b.com');
    client.signIn.mockResolvedValue(undefined);
    renderProbe();
    await waitFor(() => expect(status()).toHaveTextContent('unauthenticated'));
    await act(async () => void screen.getByText('signin').click());
    await waitFor(() => expect(status()).toHaveTextContent('authenticated'));
  });

  it('signOut clears the session', async () => {
    client.currentEmail.mockResolvedValue('a@b.com');
    client.signOut.mockResolvedValue(undefined);
    renderProbe();
    await waitFor(() => expect(status()).toHaveTextContent('authenticated'));
    await act(async () => void screen.getByText('signout').click());
    await waitFor(() => expect(status()).toHaveTextContent('unauthenticated'));
    expect(screen.getByTestId('groups')).toHaveTextContent('');
  });

  it('exposes signUp / confirmSignUp / reset passthroughs', async () => {
    client.currentEmail.mockResolvedValue(null);
    client.signUp.mockResolvedValue({ needsConfirmation: true });
    renderProbe();
    await waitFor(() => expect(status()).toHaveTextContent('unauthenticated'));
    for (const label of ['signup', 'confirm', 'reset', 'confirmreset']) {
      await act(async () => void screen.getByText(label).click());
    }
    expect(client.signUp).toHaveBeenCalledWith('a@b.com', 'pw');
    expect(client.confirmSignUp).toHaveBeenCalledWith('a@b.com', '123456');
    expect(client.resetPassword).toHaveBeenCalledWith('a@b.com');
    expect(client.confirmResetPassword).toHaveBeenCalledWith('a@b.com', '1', 'pw2');
  });
});

describe('useAuth', () => {
  it('throws outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/within an AuthProvider/);
    spy.mockRestore();
  });
});
