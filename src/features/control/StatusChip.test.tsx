import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  status: null as null | { lastHeartbeatAt: string },
  lights: undefined as undefined | object[],
}));
vi.mock('./lightsApi', () => ({
  useRunnerStatus: () => ({ data: api.status }),
  useLights: () => ({ data: api.lights }),
}));

import { StatusChip } from './StatusChip';

describe('StatusChip', () => {
  it('reads offline without a heartbeat or inventory', () => {
    render(<StatusChip now={() => 0} />);
    expect(screen.getByTestId('runner-status')).toHaveTextContent('Runner offline');
    expect(screen.getByTestId('runner-status')).toHaveAttribute('data-online', 'false');
  });
  it('reads online with the light count', () => {
    api.status = { lastHeartbeatAt: '2026-12-01T00:00:00Z' };
    api.lights = [{}, {}];
    render(<StatusChip now={() => Date.parse('2026-12-01T00:00:10Z')} />);
    expect(screen.getByTestId('runner-status')).toHaveTextContent('Online · 2 lights');
  });
});
