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
 * Layout raiz: DB local, sessão, onboarding gate + dogfood streak (M7/M8).
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
    // Logout NÃO zera onboarding (done=null causava stack zumbi + spinner).
    // Apagar conta: wipe SQLite + useOnboarding.reset().
  }, [status, refreshOnboarding]);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      const group = segments[0];
      if (group === '(app)' || group === '(onboarding)') {
        router.replace('/');
      }
      return;
    }

    // authenticated
    if (onboarded === null) return;

    const group = segments[0];
    const inApp = group === '(app)';
    const inOnboarding = group === '(onboarding)';

    if (!onboarded) {
      if (!inOnboarding) router.replace('/(onboarding)');
      return;
    }

    if (!inApp) {
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
      {/* key remonta a árvore no login/logout — evita tela (app) “zumbi” após Sair. */}
      <Stack
        key={status}
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}
      />
    </ErrorBoundary>
  );
}
