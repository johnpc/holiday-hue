import { describe, expect, it } from 'vitest';
import { clampBrightness, clampSpeed, DEFAULT_SCENE, tickIntervalMs } from './scene';
import { findPattern, PATTERNS } from './patterns';
import { findTheme, themeColors, THEMES } from './themes';

describe('scene', () => {
  it('clamps speed and brightness to their ranges', () => {
    expect(clampSpeed(0)).toBe(1);
    expect(clampSpeed(11)).toBe(10);
    expect(clampSpeed(5.6)).toBe(6);
    expect(clampBrightness(-3)).toBe(1);
    expect(clampBrightness(150)).toBe(100);
  });

  it('maps speed to a tick interval, faster = shorter', () => {
    expect(tickIntervalMs(1)).toBe(2000);
    expect(tickIntervalMs(10)).toBe(200);
    expect(tickIntervalMs(99)).toBe(200);
  });

  it('defaults reference real themes and patterns', () => {
    expect(findTheme(DEFAULT_SCENE.themeId).id).toBe(DEFAULT_SCENE.themeId);
    expect(findPattern(DEFAULT_SCENE.patternId).id).toBe(DEFAULT_SCENE.patternId);
    expect(findTheme('missing')).toBe(THEMES[0]);
    expect(findPattern('missing')).toBe(PATTERNS[0]);
  });

  it('resolves the solid theme to the custom color', () => {
    expect(themeColors('solid', '#123456')).toEqual(['#123456']);
    expect(themeColors('solid', null)).toEqual(['#ff1a1a']);
    expect(themeColors('candy-cane', '#123456')).toEqual(['#ff1a1a', '#ffffff']);
  });
});
