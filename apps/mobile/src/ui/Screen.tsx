import type { ReactNode } from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  /** false quando a tela já está sob Stack header / SafeArea do navigator */
  safe?: boolean;
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
};

/** Fundo em névoa fria — atmosfera calma sem “dashboard”. */
export function Screen({ children, style, padded = true, safe = true, edges }: Props) {
  const content = (
    <View style={[styles.content, padded && styles.padded, style]}>{children}</View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.bg, colors.bgDeep, colors.bg]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glow} pointerEvents="none" />
      {safe ? (
        <SafeAreaView style={styles.flex} edges={edges}>
          {content}
        </SafeAreaView>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { flex: 1 },
  padded: { paddingHorizontal: spacing.lg },
  glow: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primaryMuted,
    opacity: 0.55,
  },
});
