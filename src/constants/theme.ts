// Exact Stitch "Neo-Momentum" palette — Light
const LIGHT_COLORS = {
  // Primary
  primary: '#AE2F34',
  primaryContainer: '#FF6B6B',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#6D0010',

  // Secondary
  secondary: '#006A65',
  secondaryContainer: '#79F3EA',
  onSecondary: '#FFFFFF',

  // Tertiary (accent)
  tertiary: '#6D5E00',
  tertiaryContainer: '#C1AB38',
  tertiaryFixed: '#FBE36A',
  accentYellow: '#FFE66D',

  // Surface hierarchy
  background: '#FCF9F8',
  surface: '#FCF9F8',
  surfaceBright: '#FCF9F8',
  surfaceContainer: '#F0EDED',
  surfaceContainerLow: '#F6F3F2',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerHigh: '#EAE7E7',
  surfaceContainerHighest: '#E5E2E1',
  surfaceDim: '#DCD9D9',

  // Text & borders
  onSurface: '#1C1B1B',
  onSurfaceVariant: '#584140',
  text: '#1C1B1B',
  textMuted: '#8C706F',
  outline: '#8C706F',
  outlineVariant: '#E0BFBD',
  border: '#1C1B1B',

  // Error
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onError: '#FFFFFF',

  // Moment palette
  momentRed: '#FF6B6B',
  momentTeal: '#4ECDC4',
  momentYellow: '#FFE66D',

  // Shadow
  shadowColor: '#1C1B1B',
};

// Dark palette — brutalist dark variant
// Key rule: onPrimary = text ON primary-colored surfaces (must be white/light)
// primaryContainer = fill color for CTA buttons (stays vibrant)
const DARK_COLORS: typeof LIGHT_COLORS = {
  // Primary — keep vibrant fills, white text on them
  primary: '#FFB3B0',
  primaryContainer: '#FF6B6B',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#FFDAD8',

  // Secondary — vibrant teal fills
  secondary: '#5DD9D0',
  secondaryContainer: '#1A706B',
  onSecondary: '#FFFFFF',

  // Tertiary (accent) — keep yellow punchy
  tertiary: '#DEC651',
  tertiaryContainer: '#7A6C00',
  tertiaryFixed: '#FBE36A',
  accentYellow: '#FFE66D',

  // Surface hierarchy — dark backgrounds
  background: '#141313',
  surface: '#141313',
  surfaceBright: '#3D3C3B',
  surfaceContainer: '#1E1D1D',
  surfaceContainerLow: '#1A1919',
  surfaceContainerLowest: '#0F0E0E',
  surfaceContainerHigh: '#282726',
  surfaceContainerHighest: '#333231',
  surfaceDim: '#141313',

  // Text & borders — high contrast
  onSurface: '#F0EDEC',
  onSurfaceVariant: '#D7C1BF',
  text: '#F0EDEC',
  textMuted: '#A89C9B',
  outline: '#A89C9B',
  outlineVariant: '#4A3E3D',
  border: '#8A7E7D',

  // Error
  error: '#FFB4AB',
  errorContainer: '#93000A',
  onError: '#FFFFFF',

  // Moment palette (keep vibrant on dark)
  momentRed: '#FF6B6B',
  momentTeal: '#4ECDC4',
  momentYellow: '#FFE66D',

  // Shadow
  shadowColor: '#000000',
};

export type ThemeColors = typeof LIGHT_COLORS;

export { LIGHT_COLORS, DARK_COLORS };

// Default export for backwards compat during migration
export const COLORS = LIGHT_COLORS;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  page: 24,
} as const;

export const BORDERS = {
  width: 3,
  radius: 0,
  shadowOffset: { width: 4, height: 4 },
  shadowColor: '#1C1B1B',
  shadowSm: { width: 2, height: 2 },
  shadowLg: { width: 6, height: 6 },
  shadowXl: { width: 8, height: 8 },
  pressedOffset: { width: 0, height: 0 },
  pressedTranslate: { x: 4, y: 4 },
  pressedTranslateSm: { x: 2, y: 2 },
} as const;
