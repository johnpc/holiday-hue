import { beforeEach, describe, expect, it, vi } from 'vitest';

const models = vi.hoisted(() => ({
  Light: { list: vi.fn() },
  RunnerStatus: { get: vi.fn() },
}));
vi.mock('../../lib/dataClient', async () => {
  const actual =
    await vi.importActual<typeof import('../../lib/dataClient')>('../../lib/dataClient');
  return { ...actual, dataClient: { models } };
});

import { fetchLights, fetchRunnerStatus } from './lightsApi';

describe('fetchLights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('pages through every row and sorts by name', async () => {
    models.Light.list
      .mockResolvedValueOnce({ data: [{ name: 'Tree' }], nextToken: 't1' })
      .mockResolvedValueOnce({ data: [{ name: 'Lamp' }], nextToken: null });
    const rows = await fetchLights();
    expect(rows.map((r) => r.name)).toEqual(['Lamp', 'Tree']);
    expect(models.Light.list).toHaveBeenCalledTimes(2);
  });
});

describe('fetchRunnerStatus', () => {
  it('returns the heartbeat row (or null)', async () => {
    models.RunnerStatus.get.mockResolvedValue({ data: { id: 'main' } });
    expect(await fetchRunnerStatus()).toEqual({ id: 'main' });
    models.RunnerStatus.get.mockResolvedValue({ data: null });
    expect(await fetchRunnerStatus()).toBeNull();
  });
});
