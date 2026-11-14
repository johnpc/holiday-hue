import { describe, expect, it } from 'vitest';
import { parseEnv } from './env';

const ok = {
  RUNNER_USERNAME: 'u',
  RUNNER_PASSWORD: 'p',
  HUE_BRIDGE_IP: '192.168.4.47',
  HUE_APP_KEY: 'k',
};

describe('parseEnv', () => {
  it('builds the config with defaults', () => {
    expect(parseEnv(ok)).toEqual({
      username: 'u',
      password: 'p',
      bridgeIp: '192.168.4.47',
      appKey: 'k',
      outputsPath: 'amplify_outputs.json',
      pollMs: 15_000,
      heartbeatMs: 30_000,
    });
  });
  it('honors overrides', () => {
    const env = parseEnv({
      ...ok,
      AMPLIFY_OUTPUTS: '/x.json',
      RUNNER_POLL_MS: '5',
      RUNNER_HEARTBEAT_MS: '9',
    });
    expect(env.outputsPath).toBe('/x.json');
    expect(env.pollMs).toBe(5);
    expect(env.heartbeatMs).toBe(9);
  });
  it('names every missing variable', () => {
    expect(() => parseEnv({ RUNNER_USERNAME: 'u' })).toThrow(
      'missing env RUNNER_PASSWORD, HUE_BRIDGE_IP, HUE_APP_KEY',
    );
  });
});
