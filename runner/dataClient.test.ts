import { describe, expect, it, vi } from 'vitest';

const amp = vi.hoisted(() => ({ configure: vi.fn(), signIn: vi.fn(), signOut: vi.fn() }));
vi.mock('aws-amplify', () => ({ Amplify: { configure: amp.configure } }));
vi.mock('aws-amplify/auth', () => ({ signIn: amp.signIn, signOut: amp.signOut }));
vi.mock('aws-amplify/data', () => ({ generateClient: () => ({ models: {} }) }));
vi.mock('node:fs', () => {
  const readFileSync = () => '{"auth":{}}';
  return { readFileSync, default: { readFileSync } };
});

import { connect } from './dataClient';

describe('connect', () => {
  it('configures Amplify, clears any session, signs in, returns a client', async () => {
    amp.signOut.mockRejectedValue(new Error('no session'));
    amp.signIn.mockResolvedValue({});
    const data = await connect('/o.json', 'u', 'p');
    expect(amp.configure).toHaveBeenCalledWith({ auth: {} });
    expect(amp.signIn).toHaveBeenCalledWith({ username: 'u', password: 'p' });
    expect(data.models).toBeDefined();
  });
});
