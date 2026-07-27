import { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '../theme';
import { LogoMark } from './Logo';

type Props = {
  /** Compatível com o root layout — a mark não usa fonte. */
  fontsReady?: boolean;
};

/**
 * Tela breve antes do login/app: só a logomarca em fundo sólido (#EEF2F4).
 */
export function BootScreen(_props: Props) {
  const hidden = useRef(false);

  const hideNativeSplash = useCallback(() => {
    if (hidden.current) return;
    hidden.current = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void SplashScreen.hideAsync();
      });
    });
  }, []);

  useEffect(() => {
    hideNativeSplash();
  }, [hideNativeSplash]);

  return (
    <View style={styles.root} onLayout={hideNativeSplash}>
      <View style={styles.center}>
        <LogoMark size={96} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
