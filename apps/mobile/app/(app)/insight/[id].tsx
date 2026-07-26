import { useCallback, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
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
} from '../../../src/ui';

/**
 * Detalhe de insight + evidências (docs/19 §8).
 */
export default function InsightDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [detail, setDetail] = useState<InsightDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setDetail(await getInsight(id));
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Falha ao carregar');
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
    if (!id) return;
    try {
      const updated = await sendInsightFeedback(id, action);
      setDetail((prev) => (prev ? { ...prev, status: updated.status } : prev));
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Falha no feedback');
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
      </Screen>
    );
  }

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
          <Button label="Marcar útil" onPress={() => void feedback('useful')} />
          <Button
            variant="secondary"
            label="Dispensar"
            onPress={() => void feedback('dismiss')}
          />
        </View>
      </ScrollView>
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
  actions: { gap: spacing.sm, marginTop: spacing.xl },
});
