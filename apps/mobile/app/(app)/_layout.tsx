import { Stack } from 'expo-router';
import { useAuth } from '../../src/state/auth.store';
import { colors, font } from '../../src/theme';
import { BootScreen, HomeMenu } from '../../src/ui';

/**
 * Stack do app logado. Se a sessão caiu, não renderiza as telas
 * (evita “flash” da timeline enquanto o root manda para /login).
 */
export default function AppLayout() {
  const status = useAuth((s) => s.status);

  if (status !== 'authenticated') {
    return <BootScreen fontsReady />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontFamily: font.family.serif,
          fontSize: font.size.lg,
          color: colors.text,
        },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Atlas',
          headerRight: () => <HomeMenu />,
        }}
      />
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
