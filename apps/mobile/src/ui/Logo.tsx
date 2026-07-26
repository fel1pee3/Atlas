import {
  View,
  Image,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type ImageStyle,
} from 'react-native';
import { colors, font, spacing } from '../theme';

/** Única fonte do símbolo (PNG transparente). */
export const LOGO_MARK = require('../../assets/logo-mark.png');

type MarkProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

/** Símbolo Atlas — sem fundo / sem quadrado. */
export function LogoMark({ size = 48, style }: MarkProps) {
  return (
    <Image
      source={LOGO_MARK}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      accessibilityLabel="Atlas"
    />
  );
}

type LockupProps = {
  markSize?: number;
  style?: StyleProp<ViewStyle>;
  showWordmark?: boolean;
  vertical?: boolean;
};

/** Mark + wordmark “Atlas”. */
export function BrandLockup({
  markSize = 40,
  showWordmark = true,
  vertical = false,
  style,
}: LockupProps) {
  return (
    <View
      style={[styles.lockup, vertical && styles.lockupVertical, style]}
      accessibilityRole="header"
    >
      <LogoMark size={markSize} />
      {showWordmark ? (
        <Text style={[styles.wordmark, vertical && styles.wordmarkHero]}>Atlas</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  lockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  lockupVertical: {
    flexDirection: 'column',
    gap: spacing.lg,
  },
  wordmark: {
    fontFamily: font.family.serifBold,
    fontSize: font.size.xxl,
    color: colors.text,
    letterSpacing: -0.5,
  },
  wordmarkHero: {
    fontSize: 42,
    letterSpacing: -1,
    color: colors.text,
  },
});
