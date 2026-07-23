import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/state/auth.store';
import { initLocalDb } from '../src/db/client';
import { useOnboarding } from '../src/features/onboarding/onboarding.store';
import { colors } from '../src/theme';

/**
 * Layout raiz: DB local, sessão e gate auth + onboarding (docs/08, docs/19, M7).
 */
export default function RootLayout() {
  const status = useAuth((s) => s.status);
  const hydrate = useAuth((s) => s.hydrate);
  const onboarded = useOnboarding((s) => s.done);
  const refreshOnboarding = useOnboarding((s) => s.refresh);
  const resetOnboarding = useOnboarding((s) => s.reset);
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
    } else if (status === 'unauthenticated') {
      resetOnboarding();
    }
  }, [status, refreshOnboarding, resetOnboarding]);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'authenticated' && onboarded === null) return;

    const group = segments[0];
    const inApp = group === '(app)';
    const inOnboarding = group === '(onboarding)';

    if (status === 'unauthenticated') {
      if (inApp || inOnboarding) router.replace('/');
      return;
    }

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
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
    </>
  );
}
