import { StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../../src/features/onboarding/onboarding.store';
import { spacing, font, shadow, colors } from '../../src/theme';
import {
  Screen,
  LogoMark,
  Body,
  Button,
  Caption,
  OnboardingHero,
} from '../../src/ui';

/**
 * Boas-vindas + promessa de privacidade (visual do protótipo Atlas).
 */
export default function OnboardingWelcome() {
  const router = useRouter();
  const complete = useOnboarding((s) => s.complete);

  return (
    <Screen padded={false} safe={false} style={styles.screen}>
      <OnboardingHero
        source={require('../../assets/onboarding/hero-welcome.png')}
        accessibilityLabel="Símbolo do Atlas em camadas"
      />

      <View style={styles.copy}>
        <View style={styles.lockup} accessibilityRole="header">
          <LogoMark size={56} />
          <Text style={styles.wordmark}>Atlas</Text>
        </View>
        <Caption style={styles.tagline}>Sua memória pessoal</Caption>

        <Body style={styles.title}>Sob o seu controle</Body>
        <Body tone="muted" style={styles.body}>
          Os dados ficam no aparelho e na sua conta. Nada vai para IA de chat sem você pedir. Você
          pode exportar ou apagar tudo a qualquer momento.
        </Body>

        <Button
          label="Começar"
          onPress={() => router.push('/(onboarding)/connect')}
          style={styles.primaryBtn}
        />
        <Button
          variant="ghost"
          label="Já uso o Atlas — pular"
          onPress={() => {
            void complete().then(() => router.replace('/(app)'));
          }}
          style={styles.skip}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  copy: {
    flexShrink: 0,
  },
  lockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  wordmark: {
    fontFamily: font.family.serifBold,
    fontSize: 36,
    lineHeight: 40,
    color: colors.text,
    letterSpacing: -0.8,
  },
  tagline: {
    marginBottom: spacing.xl,
    fontSize: font.size.md,
  },
  title: {
    fontFamily: font.family.serifBold,
    fontSize: font.size.xxl,
    letterSpacing: -0.6,
    lineHeight: 40,
    marginBottom: spacing.md,
  },
  body: {
    marginBottom: spacing.xl,
    fontSize: font.size.lg,
    lineHeight: 26,
  },
  primaryBtn: {
    ...shadow.card,
  },
  skip: {
    marginTop: 2,
  },
});
