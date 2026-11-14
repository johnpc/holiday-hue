import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./features/auth/useAuth', () => ({
  useAuth: () => ({ status: 'unauthenticated', groups: [], email: null, signOut: vi.fn() }),
}));
vi.mock('./features/auth/SignIn', () => ({ SignIn: () => <div data-testid="signin-page" /> }));
vi.mock('./features/auth/SignUp', () => ({ SignUp: () => <div data-testid="signup-page" /> }));
vi.mock('./features/auth/ResetPassword', () => ({
  ResetPassword: () => <div data-testid="reset-page" />,
}));
vi.mock('./lib/dataClient', () => ({ dataClient: {}, unwrap: (r: { data: null }) => r.data }));

import { AppRoutes } from './AppRoutes';

const at = (path: string) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe('AppRoutes', () => {
  it('redirects a signed-out visitor from / to sign in', () => {
    at('/');
    expect(screen.getByTestId('signin-page')).toBeInTheDocument();
  });
  it('serves the auth pages', () => {
    at('/signup');
    expect(screen.getByTestId('signup-page')).toBeInTheDocument();
  });
  it('shows not-found for a stray URL', () => {
    at('/nope');
    expect(screen.getByTestId('not-found')).toBeInTheDocument();
  });
});
