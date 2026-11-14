import { describe, expect, it, vi } from 'vitest';
import { retryUntil } from './retry';

describe('retryUntil', () => {
  it('returns immediately when the first result is ok', async () => {
    const fn = vi.fn(async () => 1);
    expect(
      await retryUntil(
        fn,
        (n) => n === 1,
        3,
        0,
        async () => {},
      ),
    ).toBe(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('retries with the delay until ok', async () => {
    let n = 0;
    const sleep = vi.fn(async () => {});
    const fn = vi.fn(async () => ++n);
    expect(await retryUntil(fn, (v) => v === 3, 5, 10, sleep)).toBe(3);
    expect(sleep).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(10);
  });
  it('gives up after the attempts and returns the last result', async () => {
    const fn = vi.fn(async () => 0);
    expect(
      await retryUntil(
        fn,
        (v) => v > 0,
        3,
        0,
        async () => {},
      ),
    ).toBe(0);
    expect(fn).toHaveBeenCalledTimes(3);
  });
  it('uses a real timer by default', async () => {
    let n = 0;
    expect(
      await retryUntil(
        async () => ++n,
        (v) => v === 2,
        2,
        1,
      ),
    ).toBe(2);
  });
});
