import { describe, expect, it, vi } from 'vitest';

vi.mock('aws-amplify', () => ({ Amplify: { configure: vi.fn() } }));
vi.mock('aws-amplify/data', () => ({ generateClient: () => ({}) }));
vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
  return { ...actual, readFileSync: () => '{}', existsSync: () => false };
});

import { clearOneModel } from './seedClient';

describe('clearOneModel', () => {
  it('pages through and deletes every row, skipping nulls', async () => {
    const del = vi.fn(async (id: { id: string }) => ({ data: id }));
    const list = vi
      .fn()
      .mockResolvedValueOnce({ data: [{ id: 'a' }, null], nextToken: 'n' })
      .mockResolvedValueOnce({ data: [{ id: 'b' }], nextToken: null });
    const removed = await clearOneModel({ list, delete: del });
    expect(removed).toBe(2);
    expect(del).toHaveBeenCalledTimes(2);
    expect(list).toHaveBeenLastCalledWith({ limit: 1000, nextToken: 'n' });
  });
});
