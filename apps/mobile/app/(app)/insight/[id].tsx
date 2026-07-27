import { useCallback, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import {
  getInsight,
  sendInsightFeedback,
  type InsightDetail,
} from '../../../src/features/insights/insights.service';
import {
  eventKindLabel,
  formatEventWhen,
  insightHowLabel,
  insightThemeLabel,
  summarizeEvent,
} from '../../../src/lib/humanize';
import { colors, spacing, font } from '../../../src/theme';
import {
  Screen,
  Title,
  Body,
  Caption,
  Button,
  SectionTitle,
  EntryRow,
  Hairline,
  pagePad,
  AppDialog,
} from '../../../src/ui';

/**
 * Detalhe de insight + evidências (docs/19 §8).
 */
export default function InsightDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [detail, setDetail] = useState<InsightDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'useful' | 'dismiss' | null>(null);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setDetail(await getInsight(id));
    } catch (err) {
      setNotice({
        title: 'Erro',
        message: err instanceof Error ? err.message : 'Falha ao carregar',
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function feedback(action: 'useful' | 'dismiss') {
    if (!id || busy) return;
    setBusy(action);
    try {
      const updated = await sendInsightFeedback(id, action);
      setDetail((prev) => (prev ? { ...prev, status: updated.status } : prev));

      if (action === 'dismiss') {
        router.back();
      }
    } catch (err) {
      setNotice({
        title: 'Erro',
        message: err instanceof Error ? err.message : 'Falha no feedback',
      });
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <Screen style={styles.center} safe={false} padded={false}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (!detail) {
    return (
      <Screen style={styles.center} safe={false}>
        <Caption>Insight não encontrado.</Caption>
        <Button variant="ghost" label="Tentar de novo" onPress={() => void load()} />
        <AppDialog
          visible={notice != null}
          title={notice?.title ?? ''}
          message={notice?.message}
          onDismiss={() => setNotice(null)}
        />
      </Screen>
    );
  }

  const isUseful = detail.status === 'useful';
  const isDismissed = detail.status === 'dismissed';
  const acted = isUseful || isDismissed;

  return (
    <Screen padded={false} safe={false}>
      <ScrollView contentContainerStyle={styles.container}>
        <Caption style={styles.kind}>{insightThemeLabel(detail.kind)}</Caption>
        <Title style={styles.title}>{detail.title}</Title>
        <Body style={styles.body}>{detail.body}</Body>
        <Caption style={styles.meta}>
          Como cheguei aqui: {insightHowLabel(detail.method, detail.kind)}
          {detail.confidence != null
            ? ` · confiança ${(detail.confidence * 100).toFixed(0)}%`
            : ''}
          . Associação ≠ causa.
        </Caption>

        {isUseful ? (
          <View style={styles.statusBox} accessibilityLiveRegion="polite">
            <Caption style={styles.statusUseful}>Marcado como útil</Caption>
          </View>
        ) : null}
        {isDismissed ? (
          <View style={styles.statusBox} accessibilityLiveRegion="polite">
            <Caption style={styles.statusDismissed}>Dispensado — não aparece na lista</Caption>
          </View>
        ) : null}

        <SectionTitle>Evidências</SectionTitle>
        {detail.evidenceEvents.length === 0 ? (
          <Caption>Sem registros vinculados.</Caption>
        ) : (
          detail.evidenceEvents.map((ev, index) => (
            <View key={ev.id}>
              {index > 0 ? <Hairline /> : null}
              <EntryRow kind={eventKindLabel(ev.type)} meta={formatEventWhen(ev.occurredAt)}>
                {summarizeEvent(ev.type, ev.payload)}
              </EntryRow>
            </View>
          ))
        )}

        <View style={styles.actions}>
          {!acted ? (
            <>
              <Button
                label="Marcar útil"
                busy={busy === 'useful'}
                disabled={busy !== null}
                onPress={() => void feedback('useful')}
              />
              <Button
                variant="secondary"
                label="Dispensar"
                busy={busy === 'dismiss'}
                disabled={busy !== null}
                onPress={() => void feedback('dismiss')}
              />
            </>
          ) : isUseful ? (
            <Button
              variant="secondary"
              label="Dispensar mesmo assim"
              busy={busy === 'dismiss'}
              disabled={busy !== null}
              onPress={() => void feedback('dismiss')}
            />
          ) : (
            <Button label="Voltar à lista" onPress={() => router.back()} />
          )}
        </View>
      </ScrollView>

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
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  container: { ...pagePad },
  kind: {
    fontFamily: font.family.sansMedium,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: font.size.xxl,
    fontFamily: font.family.serifBold,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  body: { marginBottom: spacing.md, lineHeight: 24 },
  meta: { lineHeight: 20, marginBottom: spacing.sm },
  statusBox: {
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
  },
  statusUseful: {
    color: colors.primary,
    fontFamily: font.family.sansSemi,
  },
  statusDismissed: {
    color: colors.textMuted,
    fontFamily: font.family.sansSemi,
  },
  actions: { gap: spacing.sm, marginTop: spacing.xl },
});
