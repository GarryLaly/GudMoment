export const FONTS = {
  heading: 'FredokaOne-Regular',
  mono: 'SpaceMono-Regular',
  monoBold: 'SpaceMono-Bold',
  body: 'Nunito-Regular',
  bodyBold: 'Nunito-Bold',
  bodySemiBold: 'Nunito-SemiBold',
} as const;

// Typography scale matching Stitch design
export const TYPOGRAPHY = {
  // Display — Fredoka, massive, tight tracking
  display: { fontFamily: 'FredokaOne-Regular' as const, fontSize: 36, letterSpacing: -1.5 },
  // Headline — Fredoka, uppercase, tight
  headline: { fontFamily: 'FredokaOne-Regular' as const, fontSize: 28, letterSpacing: -1 },
  // Title — bold, uppercase
  title: { fontFamily: 'FredokaOne-Regular' as const, fontSize: 22, letterSpacing: -0.5 },
  titleSm: { fontFamily: 'FredokaOne-Regular' as const, fontSize: 18, letterSpacing: -0.3 },
  // Section — headline style, uppercase, primary color
  section: { fontFamily: 'FredokaOne-Regular' as const, fontSize: 24, letterSpacing: -0.5, textTransform: 'uppercase' as const },
  // Label — Space Mono, uppercase, tiny, bold tracking
  labelMono: { fontFamily: 'SpaceMono-Bold' as const, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' as const },
  // Data — Space Mono for ledger/receipt feel
  mono: { fontFamily: 'SpaceMono-Regular' as const, fontSize: 14, letterSpacing: 0 },
  monoLg: { fontFamily: 'SpaceMono-Bold' as const, fontSize: 18, letterSpacing: 0, textTransform: 'uppercase' as const },
  monoSm: { fontFamily: 'SpaceMono-Regular' as const, fontSize: 12, letterSpacing: 0, textTransform: 'uppercase' as const },
  monoXs: { fontFamily: 'SpaceMono-Bold' as const, fontSize: 10, letterSpacing: 0, textTransform: 'uppercase' as const },
  // Body — Nunito, humanist
  body: { fontFamily: 'Nunito-Regular' as const, fontSize: 14, letterSpacing: 0.25 },
  bodyLg: { fontFamily: 'Nunito-Regular' as const, fontSize: 16, letterSpacing: 0.15 },
  bodySemiBold: { fontFamily: 'Nunito-SemiBold' as const, fontSize: 16, letterSpacing: 0 },
  bodyBold: { fontFamily: 'Nunito-Bold' as const, fontSize: 16, letterSpacing: 0 },
} as const;
