import { Stack } from 'expo-router';
import { useAuth } from '../../src/state/auth.store';
import { colors, font } from '../../src/theme';
import { BootScreen } from '../../src/ui';

/** Fluxo M7 — onboarding < 5 min. */
export default function OnboardingLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Bem-vindo' }} />
      <Stack.Screen name="connect" options={{ title: 'Conectar fonte' }} />
      <Stack.Screen name="aha" options={{ title: 'Primeiro insight' }} />
    </Stack>
  );
}
