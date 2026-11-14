import { EventEmitter } from 'node:events';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fake = vi.hoisted(() => ({
  status: 200,
  body: '{"ok":1}',
  emitError: false,
  timeout: false,
}));
vi.mock('node:https', () => {
  const request = (
    _url: string,
    _opts: object,
    onRes: (res: EventEmitter & { statusCode: number; setEncoding: () => void }) => void,
  ) => {
    const req = new EventEmitter() as EventEmitter & {
      write: (b: string) => void;
      end: () => void;
      destroy: (e: Error) => void;
    };
    req.write = vi.fn();
    req.destroy = (e: Error) => req.emit('error', e);
    req.end = () => {
      if (fake.emitError) return req.emit('error', new Error('socket'));
      if (fake.timeout) return req.emit('timeout');
      const res = Object.assign(new EventEmitter(), {
        statusCode: fake.status,
        setEncoding: () => {},
      });
      onRes(res);
      res.emit('data', fake.body);
      res.emit('end');
    };
    return req;
  };
  return { request, default: { request } };
});

import { nodeTransport } from './https';

const req = { method: 'PUT' as const, url: 'https://h/x', headers: {}, body: '{}' };

describe('nodeTransport', () => {
  beforeEach(() =>
    Object.assign(fake, { status: 200, body: '{"ok":1}', emitError: false, timeout: false }),
  );
  it('resolves the body on 2xx', async () => {
    expect(await nodeTransport(req)).toBe('{"ok":1}');
  });
  it('rejects on a non-2xx status with context', async () => {
    fake.status = 403;
    fake.body = 'nope';
    await expect(nodeTransport({ ...req, method: 'GET', body: undefined })).rejects.toThrow(
      'HTTP 403 GET https://h/x nope',
    );
  });
  it('rejects on socket errors and timeouts', async () => {
    fake.emitError = true;
    await expect(nodeTransport(req)).rejects.toThrow('socket');
    fake.emitError = false;
    fake.timeout = true;
    await expect(nodeTransport(req)).rejects.toThrow('timeout');
  });
});
