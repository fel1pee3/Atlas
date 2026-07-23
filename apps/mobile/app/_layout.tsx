import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/state/auth.store';
import { initLocalDb } from '../src/db/client';
import { colors } from '../src/theme';

/**
 * Layout raiz: inicializa o DB local, hidrata a sessão e faz o "auth gate"
 * (redireciona conforme autenticação). Ver docs/08 e docs/19_UI_Screens.md.
 */
export default function RootLayout() {
  const status = useAuth((s) => s.status);
  const hydrate = useAuth((s) => s.hydrate);
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
    if (status === 'loading') return;
    const inApp = segments[0] === '(app)';
    if (status === 'authenticated' && !inApp) {
      router.replace('/(app)');
    } else if (status === 'unauthenticated' && inApp) {
      router.replace('/');
    }
  }, [status, segments, router]);

  if (status === 'loading') {
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
