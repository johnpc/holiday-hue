/** A Storage-shaped store that survives environments without localStorage
 * (Safari private mode, some jsdom setups): falls back to in-memory. */
export type Store = Pick<Storage, 'getItem' | 'setItem'>;

const memory = new Map<string, string>();
const memoryStore: Store = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => void memory.set(k, v),
};

export function safeStore(): Store {
  try {
    return window.localStorage ?? memoryStore;
  } catch {
    return memoryStore;
  }
}
