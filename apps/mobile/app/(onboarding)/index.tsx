import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../../src/features/onboarding/onboarding.store';
import { colors, spacing, radius, font } from '../../src/theme';

/**
 * Boas-vindas + promessa de privacidade (docs/19 §3, docs/20 §2.7).
 */
export default function OnboardingWelcome() {
  const router = useRouter();
  const complete = useOnboarding((s) => s.complete);

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Atlas</Text>
      <Text style={styles.title}>Sua memória pessoal, sob o seu controle</Text>
      <Text style={styles.body}>
        Os dados ficam no aparelho e na sua conta. Nada vai para IA de chat sem você pedir.
        Você pode exportar ou apagar tudo a qualquer momento.
      </Text>

      <Pressable style={styles.primary} onPress={() => router.push('/(onboarding)/connect')}>
        <Text style={styles.primaryText}>Começar</Text>
      </Pressable>

      <Pressable
        style={styles.secondary}
        onPress={() => {
          void complete().then(() => router.replace('/(app)'));
        }}
      >
        <Text style={styles.secondaryText}>Já uso o Atlas — pular</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  brand: {
    color: colors.primary,
    fontSize: font.size.xxl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: font.size.xl,
    fontWeight: '600',
    marginBottom: spacing.md,
    lineHeight: 30,
  },
  body: {
    color: colors.textMuted,
    fontSize: font.size.md,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryText: { color: colors.primaryText, fontWeight: '600', fontSize: font.size.md },
  secondary: { padding: spacing.md, alignItems: 'center' },
  secondaryText: { color: colors.textMuted, fontSize: font.size.sm },
});
