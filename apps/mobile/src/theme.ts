/**
 * Design tokens — Atlas.
 * Direção: observatório pessoal calmo (clareza + privacidade).
 * Luz fria, tinta profunda, acento sea-glass — sem roxo “IA”.
 */
export const colors = {
  bg: '#EEF2F4',
  bgDeep: '#E2E9EE',
  surface: '#FFFFFF',
  surfaceAlt: '#F7FAFB',
  border: '#D5DEE6',
  borderStrong: '#B8C4CF',
  text: '#15202B',
  textMuted: '#5A6B7A',
  textSoft: '#7A8B99',
  primary: '#2A6B63',
  primaryPressed: '#21564F',
  primaryMuted: '#D9EBE7',
  primaryText: '#FFFFFF',
  accent: '#A8895A',
  success: '#2F8F6B',
  danger: '#C45C5C',
  warn: '#A67C2A',
  overlay: 'rgba(21, 32, 43, 0.04)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 22,
  pill: 999,
};

export const font = {
  family: {
    sans: 'DMSans_400Regular',
    sansMedium: 'DMSans_500Medium',
    sansSemi: 'DMSans_600SemiBold',
    sansBold: 'DMSans_700Bold',
    serif: 'Literata_600SemiBold',
    serifBold: 'Literata_700Bold',
  },
  size: { xs: 12, sm: 13, md: 15, lg: 18, xl: 24, xxl: 34 },
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
} as const;

export const shadow = {
  card: {
    shadowColor: '#15202B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
} as const;
