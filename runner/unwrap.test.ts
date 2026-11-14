import { describe, expect, it } from 'vitest';
import { unwrapData } from './unwrap';

describe('unwrapData', () => {
  it('returns data or throws joined errors', () => {
    expect(unwrapData({ data: 1 })).toBe(1);
    expect(() => unwrapData({ data: null, errors: [{ message: 'x' }] })).toThrow('x');
  });
});
