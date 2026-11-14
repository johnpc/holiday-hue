import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SCENE } from '../../domain/scene';
import { PREVIEW_BULBS, usePreviewFrame } from './usePreviewFrame';

describe('usePreviewFrame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders no bulbs when the scene is off', () => {
    const { result } = renderHook(() => usePreviewFrame({ ...DEFAULT_SCENE, on: false }, () => 0));
    expect(result.current).toEqual([]);
  });

  it('renders PREVIEW_BULBS frames and advances on the speed interval', () => {
    const scene = { ...DEFAULT_SCENE, patternId: 'alternate', themeId: 'candy-cane', speed: 10 };
    const { result } = renderHook(() => usePreviewFrame(scene, () => 0));
    expect(result.current).toHaveLength(PREVIEW_BULBS);
    const first = result.current[0].color;
    act(() => vi.advanceTimersByTime(200));
    expect(result.current[0].color).not.toBe(first);
  });

  it('does not tick for a steady pattern', () => {
    const scene = { ...DEFAULT_SCENE, patternId: 'steady' };
    const { result } = renderHook(() => usePreviewFrame(scene, () => 0));
    const before = result.current;
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current).toEqual(before);
  });
});
