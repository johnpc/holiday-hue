import { describe, expect, it } from 'vitest';
import { DEFAULT_SCENE } from './scene';
import { toSceneRow, toSceneState } from './sceneRow';

describe('toSceneState', () => {
  it('defaults when there is no row', () => {
    expect(toSceneState(null)).toEqual(DEFAULT_SCENE);
  });
  it('clamps numbers and validates the custom color', () => {
    const s = toSceneState({
      powerOn: false,
      themeId: 'rainbow',
      patternId: 'fade',
      speed: 42,
      brightness: 0,
      customColor: 'red',
      target: '',
    });
    expect(s).toEqual({
      on: false,
      themeId: 'rainbow',
      patternId: 'fade',
      speed: 10,
      brightness: 1,
      customColor: DEFAULT_SCENE.customColor,
      target: 'all',
    });
  });
  it('keeps a valid custom color and target', () => {
    const s = toSceneState({
      powerOn: true,
      themeId: 'solid',
      patternId: 'steady',
      speed: 3,
      brightness: 50,
      customColor: '#00ff00',
      target: 'R1',
    });
    expect(s.customColor).toBe('#00ff00');
    expect(s.target).toBe('R1');
  });
  it('round-trips through toSceneRow', () => {
    expect(toSceneState(toSceneRow(DEFAULT_SCENE))).toEqual(DEFAULT_SCENE);
    expect(toSceneRow({ ...DEFAULT_SCENE, on: false }).powerOn).toBe(false);
  });
});
