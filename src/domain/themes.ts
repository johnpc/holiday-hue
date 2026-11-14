/** A holiday color theme: an ordered palette the patterns distribute across lights. */
interface Theme {
  id: string;
  name: string;
  emoji: string;
  /** Palette as #rrggbb. The 'solid' theme's palette is the user's custom color. */
  colors: string[];
  description: string;
}

export const SOLID_THEME_ID = 'solid';

export const THEMES: Theme[] = [
  {
    id: 'candy-cane',
    name: 'Candy Cane',
    emoji: '🍬',
    colors: ['#ff1a1a', '#ffffff'],
    description: 'Peppermint red and white stripes.',
  },
  {
    id: 'christmas',
    name: 'Red + Green',
    emoji: '🎄',
    colors: ['#ff1a1a', '#1fbf4a'],
    description: 'Classic Christmas red and green.',
  },
  {
    id: 'classic-bulbs',
    name: 'Classic Bulbs',
    emoji: '💡',
    colors: ['#ff1a1a', '#ff8c00', '#ffd300', '#1fbf4a', '#1e6fff'],
    description: 'The old-school C9 string: red, orange, yellow, green, blue.',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    emoji: '🌈',
    colors: ['#ff1a1a', '#ff8c00', '#ffd300', '#1fbf4a', '#1e6fff', '#5a2fcf', '#c51fa0'],
    description: 'Every color, in order.',
  },
  {
    id: 'hearth',
    name: 'Hearth',
    emoji: '🔥',
    colors: ['#ff6a00', '#ff3b00', '#ffb347', '#b3261e'],
    description: 'Warm flickering firelight oranges and embers.',
  },
  {
    id: 'white',
    name: 'Winter White',
    emoji: '❄️',
    colors: ['#fff4e0'],
    description: 'Soft warm white, like candlelight in snow.',
  },
  {
    id: SOLID_THEME_ID,
    name: 'Solid Color',
    emoji: '🎨',
    colors: ['#ff1a1a'],
    description: 'Pick any single color for every light.',
  },
];

export const DEFAULT_THEME_ID = 'christmas';

export function findTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** The palette to render: a theme's colors, or the custom color for 'solid'. */
export function themeColors(themeId: string, customColor: string | null | undefined): string[] {
  if (themeId === SOLID_THEME_ID) return [customColor ?? findTheme(SOLID_THEME_ID).colors[0]];
  return findTheme(themeId).colors;
}
