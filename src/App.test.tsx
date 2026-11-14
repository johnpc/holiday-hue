import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./features/auth/authClient', async () => {
  const actual = await vi.importActual<typeof import('./features/auth/authClient')>(
    './features/auth/authClient',
  );
  return { ...actual, currentEmail: async () => null, currentGroups: async () => [] };
});
vi.mock('./lib/dataClient', () => ({ dataClient: {}, unwrap: (r: { data: null }) => r.data }));

import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeDefined();
  });
});
