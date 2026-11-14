import { describe, expect, it, vi } from 'vitest';
import type { RunnerData } from './dataClient';
import { loadScene, subscribeScene } from './sceneSource';

type Handlers = {
  next: (row: {
    id: string;
    powerOn: boolean;
    themeId: string;
    patternId: string;
    speed: number;
    brightness: number;
    target: string;
  }) => void;
  error: (e: Error) => void;
};

function fakeData() {
  const handlers: Handlers[] = [];
  const unsubscribe = vi.fn();
  const obs = () => ({
    subscribe: (h: Handlers) => {
      handlers.push(h);
      return { unsubscribe };
    },
  });
  const models = {
    Scene: {
      get: vi.fn(async () => ({
        data: {
          id: 'main',
          powerOn: true,
          themeId: 'white',
          patternId: 'steady',
          speed: 2,
          brightness: 50,
          target: 'all',
        },
      })),
      onUpdate: obs,
      onCreate: obs,
    },
  };
  return { data: { models } as never as RunnerData, handlers, unsubscribe };
}

describe('loadScene', () => {
  it('maps the stored row', async () => {
    const { data } = fakeData();
    expect((await loadScene(data)).themeId).toBe('white');
  });
});

describe('subscribeScene', () => {
  it('forwards main-scene updates only and unsubscribes both streams', () => {
    const { data, handlers, unsubscribe } = fakeData();
    const onScene = vi.fn();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const off = subscribeScene(data, onScene);
    expect(handlers).toHaveLength(2);
    const row = {
      id: 'other',
      powerOn: true,
      themeId: 'x',
      patternId: 'y',
      speed: 1,
      brightness: 1,
      target: 'all',
    };
    handlers[0].next(row);
    expect(onScene).not.toHaveBeenCalled();
    handlers[0].next({ ...row, id: 'main' });
    expect(onScene).toHaveBeenCalledWith(expect.objectContaining({ themeId: 'x' }));
    handlers[1].error(new Error('ws'));
    expect(warn).toHaveBeenCalled();
    off();
    expect(unsubscribe).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });
});
