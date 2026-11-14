import { describe, expect, it, vi } from 'vitest';
import type { RunnerData } from './dataClient';
import { mirrorInventory, writeHeartbeat } from './mirror';

const ok = <T>(data: T) => Promise.resolve({ data });
function fakeData(statusExists: boolean, lights: { id: string; hueId: string }[]) {
  const models = {
    RunnerStatus: {
      get: vi.fn(() => ok(statusExists ? { id: 'main' } : null)),
      update: vi.fn(() => ok({})),
      create: vi.fn(() => ok({})),
    },
    Light: {
      list: vi.fn(() => ok(lights)),
      update: vi.fn(() => ok({})),
      create: vi.fn(() => ok({})),
      delete: vi.fn(() => ok({})),
    },
  };
  return { models, data: { models } as never as RunnerData };
}
const hb = { bridgeReachable: true, lightCount: 2, message: null, version: '1' };
const now = new Date('2026-12-01T00:00:00Z');
const inv = (hueId: string) => ({
  hueId,
  name: hueId,
  roomId: null,
  roomName: null,
  reachable: true,
  supportsColor: true,
  lastSeenAt: 'x',
});

describe('writeHeartbeat', () => {
  it('updates when the row exists', async () => {
    const { models, data } = fakeData(true, []);
    await writeHeartbeat(data, hb, now);
    expect(models.RunnerStatus.update).toHaveBeenCalledWith({
      id: 'main',
      ...hb,
      lastHeartbeatAt: '2026-12-01T00:00:00.000Z',
    });
    expect(models.RunnerStatus.create).not.toHaveBeenCalled();
  });
  it('creates when missing', async () => {
    const { models, data } = fakeData(false, []);
    await writeHeartbeat(data, hb, now);
    expect(models.RunnerStatus.create).toHaveBeenCalled();
  });
});

describe('mirrorInventory', () => {
  it('updates known lights, creates new ones, deletes gone ones', async () => {
    const { models, data } = fakeData(true, [
      { id: 'row1', hueId: 'a' },
      { id: 'row2', hueId: 'gone' },
    ]);
    await mirrorInventory(data, [inv('a'), inv('b')]);
    expect(models.Light.update).toHaveBeenCalledWith({ id: 'row1', ...inv('a') });
    expect(models.Light.create).toHaveBeenCalledWith(inv('b'));
    expect(models.Light.delete).toHaveBeenCalledWith({ id: 'row2' });
  });
});
