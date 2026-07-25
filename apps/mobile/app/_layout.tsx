import { useEffect, useRef } from 'react';
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
 * Layout raiz: um único lugar decide navegação por sessão.
 * Sem <Redirect> nos filhos (causava Maximum update depth exceeded).
 */
export default function RootLayout() {
  const status = useAuth((s) => s.status);
  const hydrate = useAuth((s) => s.hydrate);
  const onboarded = useOnboarding((s) => s.done);
  const refreshOnboarding = useOnboarding((s) => s.refresh);
  const segments = useSegments();
  const router = useRouter();
  const lastNav = useRef<string>('');
  const prevStatus = useRef(status);

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

    if (prevStatus.current !== status) {
      lastNav.current = '';
      prevStatus.current = status;
    }

    const group = segments[0] ?? '';
    let target: string | null = null;

    if (status === 'unauthenticated') {
      if (group === '(app)' || group === '(onboarding)') {
        target = '/';
      }
    } else if (!onboarded) {
      if (group !== '(onboarding)') target = '/(onboarding)';
    } else if (group !== '(app)') {
      target = '/(app)';
    }

    if (target && lastNav.current !== target) {
      lastNav.current = target;
      router.replace(target as '/');
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
