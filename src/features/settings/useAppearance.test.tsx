import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { APPEARANCE_KEY } from './appearance';
import { useAppearance } from './useAppearance';

describe('useAppearance', () => {
  it('starts from the stored choice and applies it on mount', () => {
    window.localStorage.setItem(APPEARANCE_KEY, 'dark');
    const { result } = renderHook(() => useAppearance());
    expect(result.current.appearance).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('persists and applies a new choice', () => {
    const { result } = renderHook(() => useAppearance());
    act(() => result.current.setAppearance('light'));
    expect(result.current.appearance).toBe('light');
    expect(window.localStorage.getItem(APPEARANCE_KEY)).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    act(() => result.current.setAppearance('system'));
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});
