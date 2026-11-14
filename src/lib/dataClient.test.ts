import { describe, expect, it } from 'vitest';
import { unwrap } from './dataClient';

describe('unwrap', () => {
  it('returns data when there are no errors', () => {
    expect(unwrap({ data: [1, 2] })).toEqual([1, 2]);
    expect(unwrap({ data: 'x', errors: [] })).toBe('x');
  });
  it('throws the joined GraphQL error messages', () => {
    expect(() => unwrap({ data: null, errors: [{ message: 'a' }, { message: 'b' }] })).toThrow(
      'a; b',
    );
  });
});
