import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  status: null as null | {
    lastHeartbeatAt: string;
    bridgeReachable: boolean;
    version?: string;
    message?: string | null;
  },
  lights: [] as { roomId: string | null; roomName: string | null }[],
}));
vi.mock('./lightsApi', () => ({
  useRunnerStatus: () => ({ data: api.status }),
  useLights: () => ({ data: api.lights }),
}));

import { RunnerStatusCard } from './RunnerStatusCard';

describe('RunnerStatusCard', () => {
  it('reports offline with help when there is no heartbeat', () => {
    render(<RunnerStatusCard now={() => 0} />);
    expect(screen.getByTestId('runner-card-state')).toHaveTextContent('Offline');
    expect(screen.getByTestId('runner-card')).toHaveTextContent('holiday-hue-runner');
  });
  it('reports online with inventory and the runner message', () => {
    const now = Date.parse('2026-12-01T00:00:30Z');
    api.status = {
      lastHeartbeatAt: '2026-12-01T00:00:00Z',
      bridgeReachable: true,
      version: '1.2',
      message: 'tick failed',
    };
    api.lights = [
      { roomId: 'R1', roomName: 'Den' },
      { roomId: 'R1', roomName: 'Den' },
    ];
    render(<RunnerStatusCard now={() => now} />);
    expect(screen.getByTestId('runner-card-state')).toHaveTextContent('Online');
    expect(screen.getByTestId('runner-card')).toHaveTextContent('2 lights in 1 rooms · v1.2');
    expect(screen.getByTestId('runner-card-message')).toHaveTextContent('tick failed');
  });
});
