import { describe, expect, it } from 'vitest';
import { hexToRgb, hexToXy, isHexColor, lerpColor, rgbToHex } from './color';

describe('color', () => {
  it('validates hex colors', () => {
    expect(isHexColor('#ff00AA')).toBe(true);
    expect(isHexColor('ff00aa')).toBe(false);
    expect(isHexColor('#fff')).toBe(false);
    expect(isHexColor(null)).toBe(false);
  });

  it('round-trips hex ↔ rgb and treats bad input as black', () => {
    expect(hexToRgb('#1e6fff')).toEqual({ r: 30, g: 111, b: 255 });
    expect(rgbToHex({ r: 30, g: 111, b: 255 })).toBe('#1e6fff');
    expect(hexToRgb('oops')).toEqual({ r: 0, g: 0, b: 0 });
    expect(rgbToHex({ r: 300, g: -5, b: 0 })).toBe('#ff0000');
  });

  it('lerps and clamps t', () => {
    expect(lerpColor('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(lerpColor('#000000', '#ffffff', 2)).toBe('#ffffff');
    expect(lerpColor('#000000', '#ffffff', -1)).toBe('#000000');
  });

  it('converts to CIE xy inside the Hue gamut', () => {
    const red = hexToXy('#ff0000');
    expect(red.x).toBeGreaterThan(0.6);
    expect(red.y).toBeLessThan(0.35);
    const white = hexToXy('#ffffff');
    expect(white.x).toBeCloseTo(0.32, 1);
    expect(white.y).toBeCloseTo(0.33, 1);
    expect(hexToXy('#000000')).toEqual({ x: 0.3127, y: 0.329 });
  });
});
