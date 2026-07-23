import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

/** Stack autenticada (docs/19_UI_Screens.md). */
export default function AppLayout() {
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
    </Stack>
  );
}
