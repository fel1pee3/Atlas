import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Literata_600SemiBold,
  Literata_700Bold,
} from '@expo-google-fonts/literata';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { useAuth } from '../src/state/auth.store';
import { initLocalDb } from '../src/db/client';
import { useOnboarding } from '../src/features/onboarding/onboarding.store';
import { recordAppOpen } from '../src/features/dogfood/dogfood.service';
import { useAutoSync } from '../src/features/sync/useAutoSync';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { colors, font } from '../src/theme';
import { BootScreen } from '../src/ui';

void SplashScreen.preventAutoHideAsync();

/**
 * Rotas:
 * - /login, /register   → autenticação (explícitas)
 * - /(app)/*            → app logado (timeline em / via (app)/index)
 * - /(onboarding)/*     → onboarding
 *
 * Importante: NÃO usar "/" como tela de login. No Expo Router o grupo
 * `(app)/index` também resolve para "/", então logout com replace('/')
 * abria a timeline ("Hoje") em vez do login.
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Literata_600SemiBold,
    Literata_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  const status = useAuth((s) => s.status);
  const hydrate = useAuth((s) => s.hydrate);
  const onboarded = useOnboarding((s) => s.done);
  const refreshOnboarding = useOnboarding((s) => s.refresh);
  const segments = useSegments();
  const router = useRouter();

  const bootReady =
    fontsLoaded &&
    status !== 'loading' &&
    !(status === 'authenticated' && onboarded === null);

  useAutoSync(status === 'authenticated' && onboarded === true);

  useEffect(() => {
    try {
      initLocalDb();
    } catch (e) {
      console.error('[Atlas] falha ao iniciar SQLite local', e);
    }
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (status === 'authenticated') {
      void refreshOnboarding();
      void recordAppOpen();
    }
  }, [status, refreshOnboarding]);

  useEffect(() => {
    if (!bootReady) return;

    const root = segments[0];
    const onAuth = root === 'login' || root === 'register';
    const inApp = root === '(app)';
    const inOnboarding = root === '(onboarding)';

    if (status === 'unauthenticated') {
      if (!onAuth) {
        router.replace('/login');
      }
      return;
    }

    // authenticated
    if (!onboarded) {
      if (!inOnboarding) router.replace('/(onboarding)');
      return;
    }

    if (onAuth || inOnboarding || !inApp) {
      router.replace('/(app)');
    }
  }, [bootReady, status, onboarded, segments, router]);

  if (!bootReady) {
    return <BootScreen fontsReady={fontsLoaded} />;
  }

  return (
    <ErrorBoundary>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          headerTitleStyle: {
            fontFamily: font.family.serif,
            fontSize: font.size.lg,
            color: colors.text,
          },
          headerBackTitleStyle: { fontFamily: font.family.sans },
        }}
      />
    </ErrorBoundary>
  );
}
