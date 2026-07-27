import { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { colors, font, spacing } from '../theme';
import { LogoMark } from './Logo';

type Props = {
  /** Literata/DM Sans carregadas — só então revelamos a marca (fiel ao Expo). */
  fontsReady?: boolean;
};

/**
 * Visual real do boot — idêntico ao que você vê no Expo.
 * Splash nativa = só névoa #EEF2F4 (sem ícone minúsculo do Android 12+).
 * Quando fontes + 1º paint estão prontos, a cor nativa some e a marca
 * entra suave — uma tela só, sem “duas splashs”.
 */
export function BootScreen({ fontsReady = true }: Props) {
  const hidden = useRef(false);
  const brand = useRef(new Animated.Value(0)).current;

  const reveal = useCallback(() => {
    if (hidden.current || !fontsReady) return;
    hidden.current = true;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void SplashScreen.hideAsync();
        Animated.timing(brand, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    });
  }, [brand, fontsReady]);

  useEffect(() => {
    reveal();
  }, [reveal]);

  return (
    <View style={styles.root} onLayout={reveal}>
      <LinearGradient
        colors={['#F5F8FA', colors.bg, colors.bgDeep]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />

      <Animated.View
        style={[
          styles.center,
          {
            opacity: brand,
            transform: [
              {
                translateY: brand.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          },
        ]}
      >
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
            fontsReady ? { fontFamily: font.family.sans } : undefined,
          ]}
        >
          Sua vida, compreendida
        </Text>
      </Animated.View>
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
