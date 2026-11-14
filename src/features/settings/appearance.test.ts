import { describe, it, expect } from 'vitest';
import { applyAppearance, readAppearance, writeAppearance, APPEARANCE_KEY } from './appearance';

describe('appearance', () => {
  it('defaults to system when nothing is stored or the value is junk', () => {
    expect(readAppearance()).toBe('system');
    window.localStorage.setItem(APPEARANCE_KEY, 'neon');
    expect(readAppearance()).toBe('system');
  });

  it('round-trips a choice through storage', () => {
    writeAppearance('dark');
    expect(readAppearance()).toBe('dark');
  });

  it('tolerates a throwing storage', () => {
    const boom = () => {
      throw new Error('nope');
    };
    const broken: Pick<Storage, 'getItem' | 'setItem'> = { getItem: boom, setItem: boom };
    expect(readAppearance(broken)).toBe('system');
    expect(() => writeAppearance('light', broken)).not.toThrow();
  });

  it('pins or clears data-theme on the root element', () => {
    const root = document.createElement('html');
    applyAppearance('dark', root);
    expect(root.getAttribute('data-theme')).toBe('dark');
    applyAppearance('light', root);
    expect(root.getAttribute('data-theme')).toBe('light');
    applyAppearance('system', root);
    expect(root.hasAttribute('data-theme')).toBe(false);
  });

  it('defaults to the document root', () => {
    applyAppearance('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    applyAppearance('system');
  });
});
