import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const signOut = vi.hoisted(() => vi.fn());
const replace = vi.hoisted(() => vi.fn());
const auth = vi.hoisted(() => ({ email: 'a@b.com' as string | null }));
vi.mock('../auth/useAuth', () => ({ useAuth: () => ({ email: auth.email, signOut }) }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useHistory: () => ({ replace }) };
});

import { APPEARANCE_KEY } from './appearance';
import { Settings } from './Settings';

function renderSettings(extra?: React.ReactNode) {
  return render(
    <MemoryRouter>
      <Settings extra={extra} />
    </MemoryRouter>,
  );
}

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.email = 'a@b.com';
    signOut.mockResolvedValue(undefined);
  });

  it('falls back to a placeholder when there is no email', () => {
    auth.email = null;
    renderSettings();
    expect(screen.getByTestId('account-email')).toHaveTextContent('Not signed in');
  });

  it('shows the account email and the three appearance options', () => {
    renderSettings();
    expect(screen.getByTestId('account-email')).toHaveTextContent('a@b.com');
    expect(screen.getByTestId('appearance-segment')).toHaveAttribute('value', 'system');
    for (const a of ['light', 'dark', 'system']) {
      expect(screen.getByTestId(`appearance-${a}`)).toBeInTheDocument();
    }
  });

  it('persists an appearance change from the segment', () => {
    renderSettings();
    fireEvent(
      screen.getByTestId('appearance-segment'),
      new CustomEvent('ionChange', { detail: { value: 'dark' } }),
    );
    expect(window.localStorage.getItem(APPEARANCE_KEY)).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('signs out and returns to the sign-in screen', async () => {
    renderSettings();
    fireEvent.click(screen.getByTestId('sign-out'));
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/signin'));
    expect(signOut).toHaveBeenCalled();
  });

  it('renders the extra slot below Account', () => {
    renderSettings(<div data-testid="extra">runner</div>);
    expect(screen.getByTestId('extra')).toBeInTheDocument();
  });
});
