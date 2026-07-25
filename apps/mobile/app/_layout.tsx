import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/state/auth.store';
import { initLocalDb } from '../src/db/client';
import { useOnboarding } from '../src/features/onboarding/onboarding.store';
import { recordAppOpen } from '../src/features/dogfood/dogfood.service';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { colors } from '../src/theme';

/**
 * Rotas:
 * - /login              → autenticação (explícita)
 * - /(app)/*            → app logado (timeline em / via (app)/index)
 * - /(onboarding)/*     → onboarding
 *
 * Importante: NÃO usar "/" como tela de login. No Expo Router o grupo
 * `(app)/index` também resolve para "/", então logout com replace('/')
 * abria a timeline ("Hoje") em vez do login.
 */
export default function RootLayout() {
  const status = useAuth((s) => s.status);
  const hydrate = useAuth((s) => s.hydrate);
  const onboarded = useOnboarding((s) => s.done);
  const refreshOnboarding = useOnboarding((s) => s.refresh);
  const segments = useSegments();
  const router = useRouter();

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
    if (status === 'loading') return;
    if (status === 'authenticated' && onboarded === null) return;

    const root = segments[0];
    const onLogin = root === 'login';
    const inApp = root === '(app)';
    const inOnboarding = root === '(onboarding)';

    if (status === 'unauthenticated') {
      if (!onLogin) {
        router.replace('/login');
      }
      return;
    }

    // authenticated
    if (!onboarded) {
      if (!inOnboarding) router.replace('/(onboarding)');
      return;
    }

    if (onLogin || inOnboarding || !inApp) {
      router.replace('/(app)');
    }
  }, [status, onboarded, segments, router]);

  if (status === 'loading' || (status === 'authenticated' && onboarded === null)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
    </ErrorBoundary>
  );
}
