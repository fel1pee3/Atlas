import { Text, StyleSheet, type TextProps, type TextStyle, type StyleProp } from 'react-native';
import { colors, font } from '../theme';

type Props = TextProps & {
  tone?: 'default' | 'muted' | 'soft' | 'primary' | 'danger' | 'accent';
  style?: StyleProp<TextStyle>;
};

export function Brand({ children, style, ...rest }: Props) {
  return (
    <Text {...rest} style={[styles.brand, style]}>
      {children}
    </Text>
  );
}

export function Title({ children, style, tone = 'default', ...rest }: Props) {
  return (
    <Text {...rest} style={[styles.title, toneStyle(tone), style]}>
      {children}
    </Text>
  );
}

export function Body({ children, style, tone = 'default', ...rest }: Props) {
  return (
    <Text {...rest} style={[styles.body, toneStyle(tone), style]}>
      {children}
    </Text>
  );
}

export function Caption({ children, style, tone = 'muted', ...rest }: Props) {
  return (
    <Text {...rest} style={[styles.caption, toneStyle(tone), style]}>
      {children}
    </Text>
  );
}

export function Label({ children, style, tone = 'default', ...rest }: Props) {
  return (
    <Text {...rest} style={[styles.label, toneStyle(tone), style]}>
      {children}
    </Text>
  );
}

function toneStyle(tone: NonNullable<Props['tone']>) {
  switch (tone) {
    case 'muted':
      return { color: colors.textMuted };
    case 'soft':
      return { color: colors.textSoft };
    case 'primary':
      return { color: colors.primary };
    case 'danger':
      return { color: colors.danger };
    case 'accent':
      return { color: colors.accent };
    default:
      return { color: colors.text };
  }
}

const styles = StyleSheet.create({
  brand: {
    fontFamily: font.family.serifBold,
    fontSize: font.size.xxl,
    color: colors.text,
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: font.family.serif,
    fontSize: font.size.xl,
    color: colors.text,
    letterSpacing: -0.3,
  },
  body: {
    fontFamily: font.family.sans,
    fontSize: font.size.md,
    color: colors.text,
    lineHeight: 22,
  },
  caption: {
    fontFamily: font.family.sans,
    fontSize: font.size.sm,
    color: colors.textMuted,
    lineHeight: 18,
  },
  label: {
    fontFamily: font.family.sansSemi,
    fontSize: font.size.md,
    color: colors.text,
  },
});
