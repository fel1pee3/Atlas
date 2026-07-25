import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/state/auth.store';
import { colors } from '../../src/theme';

/**
 * Stack do app logado. Se a sessão caiu, não renderiza as telas
 * (evita “flash” da timeline enquanto o root manda para /login).
 */
export default function AppLayout() {
  const status = useAuth((s) => s.status);

  if (status !== 'authenticated') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Hoje' }} />
      <Stack.Screen name="add" options={{ title: 'Registrar', presentation: 'modal' }} />
      <Stack.Screen name="health" options={{ title: 'Saúde' }} />
      <Stack.Screen name="sources" options={{ title: 'Espaço & agenda' }} />
      <Stack.Screen name="insights" options={{ title: 'Insights' }} />
      <Stack.Screen name="insight/[id]" options={{ title: 'Insight' }} />
      <Stack.Screen name="search" options={{ title: 'Busca' }} />
      <Stack.Screen name="settings" options={{ title: 'Ajustes' }} />
    </Stack>
  );
}
