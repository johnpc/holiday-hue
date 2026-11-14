import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({
  status: 'authenticated' as 'loading' | 'authenticated' | 'unauthenticated',
  groups: [] as string[],
  email: 'me@x.com',
  signOut: vi.fn(),
}));
vi.mock('../auth/useAuth', () => ({ useAuth: () => auth }));

import { HouseholdGate } from './HouseholdGate';

const renderGate = () =>
  render(
    <MemoryRouter initialEntries={['/lights']}>
      <Route path="/signin">
        <div data-testid="signin" />
      </Route>
      <Route path="/lights">
        <HouseholdGate>
          <div data-testid="inside" />
        </HouseholdGate>
      </Route>
    </MemoryRouter>,
  );

describe('HouseholdGate', () => {
  beforeEach(() => {
    auth.status = 'authenticated';
    auth.groups = [];
  });
  it('spins while auth loads', () => {
    auth.status = 'loading';
    renderGate();
    expect(screen.getByTestId('household-loading')).toBeInTheDocument();
  });
  it('redirects signed-out visitors to sign in', () => {
    auth.status = 'unauthenticated';
    renderGate();
    expect(screen.getByTestId('signin')).toBeInTheDocument();
  });
  it('blocks accounts outside the household, with sign out', () => {
    renderGate();
    expect(screen.getByTestId('household-denied')).toHaveTextContent('me@x.com');
    fireEvent.click(screen.getByTestId('household-sign-out'));
    expect(auth.signOut).toHaveBeenCalled();
  });
  it('renders children for members', () => {
    auth.groups = ['editors'];
    renderGate();
    expect(screen.getByTestId('inside')).toBeInTheDocument();
  });
});
