// Exact Stitch "Neo-Momentum" palette
export const COLORS = {
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

  // Surface hierarchy — "Importance through Tint"
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

  // Moment palette colors (used in cards)
  momentRed: '#FF6B6B',
  momentTeal: '#4ECDC4',
  momentYellow: '#FFE66D',
} as const;

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
