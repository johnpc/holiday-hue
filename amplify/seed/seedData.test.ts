import { describe, expect, it, vi } from 'vitest';

const models = vi.hoisted(() => {
  const ok = async () => ({ data: {} });
  const empty = async () => ({ data: [], nextToken: null });
  return {
    Scene: { create: vi.fn(ok), list: vi.fn(empty), delete: vi.fn(ok) },
    Light: { create: vi.fn(ok), list: vi.fn(empty), delete: vi.fn(ok) },
    RunnerStatus: { create: vi.fn(ok), list: vi.fn(empty), delete: vi.fn(ok) },
  };
});
vi.mock('./seedClient', () => ({
  client: { models },
  clearOneModel: async (m: { list: () => Promise<{ data: [] }> }) => (await m.list()).data.length,
}));

import { LIGHTS } from './fixtures/lights';
import { clearAll, seedAll } from './seedData';

describe('seed', () => {
  it('clears every model', async () => {
    await clearAll();
    expect(models.Scene.list).toHaveBeenCalled();
    expect(models.Light.list).toHaveBeenCalled();
    expect(models.RunnerStatus.list).toHaveBeenCalled();
  });
  it('seeds the scene, lights and a stale heartbeat', async () => {
    await seedAll(new Date('2026-12-01T00:00:00Z'));
    expect(models.Scene.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'main', powerOn: true }),
    );
    expect(models.Light.create).toHaveBeenCalledTimes(LIGHTS.length);
    expect(models.RunnerStatus.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'main', bridgeReachable: false }),
    );
  });
  it('surfaces GraphQL errors', async () => {
    models.Scene.create.mockResolvedValueOnce({
      data: null,
      errors: [{ message: 'denied' }],
    } as never);
    await expect(seedAll(new Date())).rejects.toThrow('denied');
  });
});
