import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DEFAULT_SCENE } from '../../domain/scene';

const models = vi.hoisted(() => ({
  Scene: { get: vi.fn(), create: vi.fn(), update: vi.fn() },
}));
vi.mock('../../lib/dataClient', async () => {
  const actual =
    await vi.importActual<typeof import('../../lib/dataClient')>('../../lib/dataClient');
  return { ...actual, dataClient: { models } };
});

import { fetchScene, writeScene } from './sceneApi';

const row = {
  id: 'main',
  powerOn: true,
  themeId: 'rainbow',
  patternId: 'fade',
  speed: 3,
  brightness: 50,
  customColor: null,
  target: 'all',
};

describe('fetchScene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('maps the stored row', async () => {
    models.Scene.get.mockResolvedValue({ data: row });
    const s = await fetchScene();
    expect(s.themeId).toBe('rainbow');
    expect(s.customColor).toBe(DEFAULT_SCENE.customColor);
    expect(models.Scene.create).not.toHaveBeenCalled();
  });
  it('creates the default row on a fresh backend', async () => {
    models.Scene.get.mockResolvedValue({ data: null });
    models.Scene.create.mockResolvedValue({ data: { ...row, themeId: DEFAULT_SCENE.themeId } });
    const s = await fetchScene();
    expect(models.Scene.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'main', powerOn: true }),
    );
    expect(s.themeId).toBe(DEFAULT_SCENE.themeId);
  });
  it('throws on GraphQL errors', async () => {
    models.Scene.get.mockResolvedValue({ data: null, errors: [{ message: 'Unauthorized' }] });
    await expect(fetchScene()).rejects.toThrow('Unauthorized');
  });
});

describe('writeScene', () => {
  it('maps on → powerOn and only sends the patch', async () => {
    models.Scene.update.mockResolvedValue({ data: row });
    await writeScene({ on: false, speed: 9 });
    expect(models.Scene.update).toHaveBeenCalledWith({ id: 'main', powerOn: false, speed: 9 });
    await writeScene({ themeId: 'white' });
    expect(models.Scene.update).toHaveBeenLastCalledWith({ id: 'main', themeId: 'white' });
  });
});
