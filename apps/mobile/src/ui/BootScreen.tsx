import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { colors, font, spacing } from '../theme';
import { LogoMark } from './Logo';

type Props = {
  /** Só esconde o splash nativo quando a fonte Literata já carregou. */
  fontsReady?: boolean;
};

/**
 * Primeira tela do Atlas — marca flutuando na névoa, sem card/quadrado.
 */
export function BootScreen({ fontsReady = true }: Props) {
  useEffect(() => {
    if (!fontsReady) return;
    void SplashScreen.hideAsync();
  }, [fontsReady]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#F5F8FA', colors.bg, colors.bgDeep]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />

      <View style={styles.center}>
        <LogoMark size={72} />
        <Text
          style={[
            styles.wordmark,
            fontsReady
              ? { fontFamily: font.family.serifBold }
              : { fontWeight: '700' },
          ]}
          accessibilityRole="header"
        >
          Atlas
        </Text>
        <Text
          style={[
            styles.tagline,
            fontsReady
              ? { fontFamily: font.family.sans }
              : undefined,
          ]}
        >
          Sua vida, compreendida
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.primaryMuted,
    opacity: 0.55,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -140,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(42, 107, 99, 0.08)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  wordmark: {
    marginTop: spacing.sm,
    fontSize: 34,
    color: colors.text,
    letterSpacing: -0.8,
  },
  tagline: {
    marginTop: spacing.xs,
    fontSize: font.size.sm,
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
});
