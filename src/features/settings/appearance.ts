import { safeStore, type Store } from '../../lib/storage';

/** Light / dark / follow-the-OS. Pure helpers over localStorage + <html data-theme>. */
export type Appearance = 'light' | 'dark' | 'system';

export const APPEARANCE_KEY = 'hh.appearance';
export const APPEARANCES: Appearance[] = ['light', 'dark', 'system'];

const isAppearance = (v: string | null): v is Appearance =>
  v === 'light' || v === 'dark' || v === 'system';

/** The persisted choice, defaulting to 'system' when unset or unreadable. */
export function readAppearance(storage: Store = safeStore()): Appearance {
  try {
    const v = storage.getItem(APPEARANCE_KEY);
    return isAppearance(v) ? v : 'system';
  } catch {
    return 'system';
  }
}

export function writeAppearance(value: Appearance, storage: Store = safeStore()): void {
  try {
    storage.setItem(APPEARANCE_KEY, value);
  } catch {
    /* private mode / quota — the choice just won't persist */
  }
}

/**
 * Apply a choice to the document: `data-theme="light|dark"` pins the palette
 * (src/theme/variables.css keys off it); 'system' removes the attribute so the
 * OS `prefers-color-scheme` media query decides.
 */
export function applyAppearance(value: Appearance, root: HTMLElement = document.documentElement) {
  if (value === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', value);
}
