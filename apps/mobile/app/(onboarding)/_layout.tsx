import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

/** Fluxo M7 — onboarding < 5 min (docs/19 §3, docs/20 §2.7). */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Bem-vindo' }} />
      <Stack.Screen name="connect" options={{ title: 'Conectar fonte' }} />
      <Stack.Screen name="aha" options={{ title: 'Primeiro insight' }} />
    </Stack>
  );
}
