import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { colors, font, spacing } from '../theme';

type Props = {
  /** Só esconde o splash nativo quando a fonte Literata já carregou. */
  fontsReady?: boolean;
};

/**
 * Tela de carregamento do Atlas — só o nome no centro.
 * Fundo névoa + glow; tipografia Literata. Sem tagline / spinner.
 */
export function BootScreen({ fontsReady = true }: Props) {
  useEffect(() => {
    if (!fontsReady) return;
    void SplashScreen.hideAsync();
  }, [fontsReady]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.bg, colors.bgDeep, colors.bg]}
        locations={[0, 0.42, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glow} pointerEvents="none" />
      <Text
        style={[
          styles.brand,
          fontsReady
            ? { fontFamily: font.family.serifBold }
            : { fontWeight: '700' },
        ]}
        accessibilityRole="header"
      >
        Atlas
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  glow: {
    position: 'absolute',
    top: -100,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.primaryMuted,
    opacity: 0.7,
  },
  brand: {
    fontSize: 40,
    color: colors.text,
    letterSpacing: -0.8,
  },
});
