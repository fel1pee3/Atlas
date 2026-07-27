import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing, font, shadow } from '../../theme';
import { Screen, Body, Button, OnboardingHero, OnboardingProgress, AppDialog } from '../../ui';
import {
  CONNECT_SOURCES,
  CONNECT_TOTAL_STEPS,
  type ConnectSourceKind,
} from './connect-sources';

type Props = {
  kind: ConnectSourceKind;
  /** CTA pode sobrescrever o texto padrão (ex.: label do conector). */
  ctaLabel?: string;
  onConnect: () => Promise<void>;
};

/**
 * Layout compartilhado das 3 telas “Conectar fonte” (visual do protótipo Atlas).
 * Erros usam AppDialog; permissão do SO vem direto do conector (sem priming).
 */
export function ConnectSourceScreen({ kind, ctaLabel, onConnect }: Props) {
  const router = useRouter();
  const content = CONNECT_SOURCES[kind];
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  const goNext = () => {
    router.push(content.nextRoute);
  };

  const handleConnect = async () => {
    setBusy(true);
    try {
      await onConnect();
      goNext();
    } catch (err) {
      setNotice({
        title: 'Não foi possível conectar',
        message: err instanceof Error ? err.message : 'Falha ao conectar',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen padded={false} safe={false} style={styles.screen}>
      <OnboardingHero source={content.hero} accessibilityLabel={content.heroAlt} />

      <View style={styles.copy}>
        <OnboardingProgress total={CONNECT_TOTAL_STEPS} current={content.step} />
        <Body style={styles.title}>{content.title}</Body>
        <Body tone="muted" style={styles.body}>
          {content.body}
        </Body>

        <Button
          label={ctaLabel ?? content.cta}
          onPress={() => void handleConnect()}
          busy={busy}
          style={styles.primaryBtn}
        />
        <Button variant="ghost" label="Agora não — pular" onPress={goNext} disabled={busy} />
      </View>

      <AppDialog
        visible={notice != null}
        title={notice?.title ?? ''}
        message={notice?.message}
        onDismiss={() => setNotice(null)}
      />
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
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  title: {
    marginTop: spacing.lg,
    fontFamily: font.family.serifBold,
    fontSize: font.size.xxl,
    letterSpacing: -0.6,
    lineHeight: 40,
  },
  body: {
    marginBottom: spacing.lg,
    fontSize: font.size.lg,
    lineHeight: 26,
  },
  primaryBtn: {
    ...shadow.card,
    marginTop: spacing.xs,
  },
});
