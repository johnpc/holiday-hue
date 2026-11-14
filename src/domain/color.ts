/** Pure color math shared by the app preview and the Hue runner. */
interface Rgb {
  r: number;
  g: number;
  b: number;
}

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(value: string | null | undefined): value is string {
  return typeof value === 'string' && HEX_COLOR_RE.test(value);
}

export function hexToRgb(hex: string): Rgb {
  const clean = isHexColor(hex) ? hex.slice(1) : '000000';
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

const toHex2 = (n: number) =>
  Math.round(clamp01(n / 255) * 255)
    .toString(16)
    .padStart(2, '0');

export function rgbToHex({ r, g, b }: Rgb): string {
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Linear blend of two hex colors; t=0 → a, t=1 → b. */
export function lerpColor(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const k = clamp01(t);
  return rgbToHex({
    r: ca.r + (cb.r - ca.r) * k,
    g: ca.g + (cb.g - ca.g) * k,
    b: ca.b + (cb.b - ca.b) * k,
  });
}

/** sRGB companding → linear, per Philips' Hue color conversion guide. */
const linearize = (c: number) => (c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92);

/** CIE 1931 xy chromaticity for a hex color (what CLIP v2 `color.xy` expects). */
export function hexToXy(hex: string): { x: number; y: number } {
  const { r, g, b } = hexToRgb(hex);
  const R = linearize(r / 255);
  const G = linearize(g / 255);
  const B = linearize(b / 255);
  const X = R * 0.664511 + G * 0.154324 + B * 0.162028;
  const Y = R * 0.283881 + G * 0.668433 + B * 0.047685;
  const Z = R * 0.000088 + G * 0.07231 + B * 0.986039;
  const sum = X + Y + Z;
  if (sum === 0) return { x: 0.3127, y: 0.329 }; // black → D65 white point
  return { x: round4(X / sum), y: round4(Y / sum) };
}

const round4 = (n: number) => Math.round(n * 10000) / 10000;
