import type { Theme } from '@/lib/theme';

export type FieldPalette = {
  accent: string;
  /** Colour of the ~84% of particles that are not accent-coloured. */
  base: string;
  pointOpacity: number;
  pointSize: number;
  shapeColor: string;
  shapeOpacities: [number, number];
};

type Rgb = { r: number; g: number; b: number };

const FALLBACK_ACCENT = '#c6f24e';

function parseHex(hex: string): Rgb {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return parseHex(FALLBACK_ACCENT);
  const value = Number.parseInt(match[1]!, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function toHex({ r, g, b }: Rgb): string {
  const channel = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

/** Darkens an accent so it stays legible against the light theme's paper background. */
function scale(hex: string, factor: number): string {
  const { r, g, b } = parseHex(hex);
  return toHex({ r: r * factor, g: g * factor, b: b * factor });
}

/**
 * Reads the accent straight from the stylesheet so CSS remains the single
 * source of truth for brand colour — change `--accent` and the 3D field follows.
 */
export function readAccent(): string {
  if (typeof window === 'undefined') return FALLBACK_ACCENT;
  const value = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  return value || FALLBACK_ACCENT;
}

export function createPalette(theme: Theme, accent: string): FieldPalette {
  return theme === 'light'
    ? {
        accent: scale(accent, 0.4),
        base: '#33302a',
        pointOpacity: 0.68,
        pointSize: 0.09,
        shapeColor: scale(accent, 0.26),
        shapeOpacities: [0.34, 0.56],
      }
    : {
        accent,
        base: '#b9c0c7',
        pointOpacity: 0.62,
        pointSize: 0.075,
        shapeColor: accent,
        shapeOpacities: [0.13, 0.09],
      };
}
