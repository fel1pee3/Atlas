/**
 * Tokens de design (subconjunto do docs/18_Design_System.md).
 * Estética "calma e confiança" — foco no insight, não no dado bruto.
 * Na V1 migrar para Restyle com tema completo light/dark.
 */
export const colors = {
  bg: '#0E0F13',
  surface: '#16181F',
  surfaceAlt: '#1E212B',
  border: '#2A2E3A',
  text: '#EDEFF5',
  textMuted: '#9BA1B0',
  primary: '#6C5CE7', // violeta = inferência/insight (peça-assinatura)
  primaryText: '#FFFFFF',
  success: '#3FB68B',
  danger: '#E5687A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
};

export const font = {
  size: { sm: 13, md: 15, lg: 18, xl: 24, xxl: 32 },
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
} as const;
