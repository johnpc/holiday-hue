import { describe, expect, it, vi } from 'vitest';
import { createHueClient, toClipBody } from './hueClient';
import type { JsonRequest } from './https';

describe('toClipBody', () => {
  it('serializes a full on-command', () => {
    expect(
      JSON.parse(toClipBody({ on: true, xy: { x: 0.6, y: 0.3 }, brightness: 50, durationMs: 300 })),
    ).toEqual({
      on: { on: true },
      color: { xy: { x: 0.6, y: 0.3 } },
      dimming: { brightness: 50 },
      dynamics: { duration: 300 },
    });
  });
  it('drops color/dimming when turning off', () => {
    expect(JSON.parse(toClipBody({ on: false, xy: { x: 0.6, y: 0.3 }, brightness: 50 }))).toEqual({
      on: { on: false },
    });
  });
});

describe('createHueClient', () => {
  const calls: JsonRequest[] = [];
  const transport = vi.fn(async (req: JsonRequest) => {
    calls.push(req);
    if (req.method === 'GET') return JSON.stringify({ data: [{ id: 'l1' }] });
    return '{"data":[]}';
  });
  const client = createHueClient('1.2.3.4', 'KEY', transport);

  it('GETs resources with the app key header and unwraps data', async () => {
    const lights = await client.listLights();
    expect(lights).toEqual([{ id: 'l1' }]);
    expect(calls[0].url).toBe('https://1.2.3.4/clip/v2/resource/light');
    expect(calls[0].headers['hue-application-key']).toBe('KEY');
    expect((await client.listRooms()).length).toBe(1);
  });

  it('PUTs a light command', async () => {
    await client.setLight('l9', { on: true, brightness: 10 });
    const put = calls.at(-1)!;
    expect(put.method).toBe('PUT');
    expect(put.url).toMatch(/\/light\/l9$/);
    expect(JSON.parse(put.body!)).toEqual({ on: { on: true }, dimming: { brightness: 10 } });
  });

  it('returns [] for a malformed payload', async () => {
    const odd = createHueClient('h', 'k', async () => '{"nope":1}');
    expect(await odd.listLights()).toEqual([]);
  });
});
