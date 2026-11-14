import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/react';
import { beforeEach } from 'vitest';

configure({ asyncUtilTimeout: 5000 });

// Some jsdom runs (seen under the husky hook) expose no window.localStorage at
// all; give tests a plain in-memory one so storage-backed code is testable.
if (!window.localStorage) {
  const mem = new Map<string, string>();
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
      clear: () => mem.clear(),
    },
  });
}

beforeEach(() => {
  try {
    window.localStorage.clear();
  } catch {
    /* jsdom without storage */
  }
});

window.matchMedia =
  window.matchMedia ||
  function () {
    return { matches: false, addListener: function () {}, removeListener: function () {} };
  };
