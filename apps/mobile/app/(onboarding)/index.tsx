import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../../src/features/onboarding/onboarding.store';
import { spacing, font } from '../../src/theme';
import { Screen, BrandLockup, Body, Button, Caption } from '../../src/ui';

/**
 * Boas-vindas + promessa de privacidade (docs/19 §3, docs/20 §2.7).
 */
export default function OnboardingWelcome() {
  const router = useRouter();
  const complete = useOnboarding((s) => s.complete);

  return (
    <Screen style={styles.container} safe={false}>
      <BrandLockup markSize={48} style={styles.brand} />
      <Caption style={styles.date}>Sua memória pessoal</Caption>
      <Body style={styles.title}>Sob o seu controle</Body>
      <Body tone="muted" style={styles.body}>
        Os dados ficam no aparelho e na sua conta. Nada vai para IA de chat sem você pedir. Você
        pode exportar ou apagar tudo a qualquer momento.
      </Body>

      <Button label="Começar" onPress={() => router.push('/(onboarding)/connect')} />
      <Button
        variant="ghost"
        label="Já uso o Atlas — pular"
        onPress={() => {
          void complete().then(() => router.replace('/(app)'));
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', paddingVertical: spacing.lg },
  brand: { marginBottom: spacing.xs },
  date: { marginBottom: spacing.lg },
  title: {
    fontFamily: font.family.serifBold,
    fontSize: font.size.xl,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
    lineHeight: 30,
  },
  body: { marginBottom: spacing.xl, lineHeight: 22 },
});
