import { afterEach, describe, expect, it } from 'vitest';
import { safeStore } from './storage';

describe('safeStore', () => {
  const real = Object.getOwnPropertyDescriptor(window, 'localStorage');
  afterEach(() => {
    if (real) Object.defineProperty(window, 'localStorage', real);
  });
  it('returns localStorage when available', () => {
    expect(safeStore()).toBe(window.localStorage);
  });
  it('falls back to a working in-memory store when localStorage is missing or throws', () => {
    Object.defineProperty(window, 'localStorage', { configurable: true, get: () => undefined });
    const s = safeStore();
    s.setItem('k', 'v');
    expect(s.getItem('k')).toBe('v');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => {
        throw new Error('denied');
      },
    });
    expect(safeStore().getItem('k')).toBe('v');
  });
});
