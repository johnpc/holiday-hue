/** How a palette moves across the lights over time. */
interface Pattern {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** Whether speed changes anything (steady is static). */
  animated: boolean;
}

export const PATTERNS: Pattern[] = [
  {
    id: 'steady',
    name: 'Steady',
    emoji: '🕯️',
    description: 'Colors spread across the lights and hold still.',
    animated: false,
  },
  {
    id: 'twinkle',
    name: 'Twinkle',
    emoji: '✨',
    description: 'Random lights sparkle brighter, then settle.',
    animated: true,
  },
  {
    id: 'alternate',
    name: 'Alternate',
    emoji: '🔁',
    description: 'Each light steps to the next color in the palette.',
    animated: true,
  },
  {
    id: 'fade',
    name: 'Fade',
    emoji: '🌊',
    description: 'Colors flow smoothly from light to light.',
    animated: true,
  },
];

export const DEFAULT_PATTERN_ID = 'twinkle';

export function findPattern(id: string): Pattern {
  return PATTERNS.find((p) => p.id === id) ?? PATTERNS[0];
}
