import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { isCrossDomainKind } from '@atlas/shared';
import {
  getInsight,
  sendInsightFeedback,
  type InsightDetail,
} from '../../../src/features/insights/insights.service';
import { colors, spacing, radius, font } from '../../../src/theme';

/**
 * Detalhe de insight + evidências (docs/19 §8 — explicabilidade total).
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
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.textMuted }}>Insight não encontrado.</Text>
        <Pressable onPress={() => void load()} style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.primary }}>Tentar de novo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.method}>
        {isCrossDomainKind(detail.kind) ? 'cross-domain' : detail.method} · {detail.kind}
      </Text>
      <Text style={styles.title}>{detail.title}</Text>
      <Text style={styles.body}>{detail.body}</Text>
      <Text style={styles.meta}>
        Como cheguei aqui:{' '}
        {detail.method === 'rule'
          ? 'regra determinística'
          : isCrossDomainKind(detail.kind)
            ? 'estatística cross-domain (médias condicionais / diferença de grupos)'
            : 'estatística descritiva'}
        {detail.confidence != null
          ? ` · confiança ${(detail.confidence * 100).toFixed(0)}%`
          : ''}
        . Associação ≠ causa.
      </Text>

      <Text style={styles.section}>Evidências</Text>
      {detail.evidenceEvents.length === 0 ? (
        <Text style={styles.meta}>Sem eventos vinculados.</Text>
      ) : (
        detail.evidenceEvents.map((ev) => (
          <View key={ev.id} style={styles.evidence}>
            <Text style={styles.evidenceType}>{ev.type}</Text>
            <Text style={styles.evidenceSummary}>{summarize(ev.type, ev.payload)}</Text>
            <Text style={styles.meta}>{new Date(ev.occurredAt).toLocaleString()}</Text>
          </View>
        ))
      )}

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={() => void feedback('useful')}>
          <Text style={styles.buttonText}>Marcar útil</Text>
        </Pressable>
        <Pressable style={styles.buttonSecondary} onPress={() => void feedback('dismiss')}>
          <Text style={styles.buttonSecondaryText}>Dispensar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function summarize(type: string, payload: Record<string, unknown>): string {
  if (type === 'sleep.recorded') {
    const min = Number(payload.durationMin);
    if (!Number.isFinite(min)) return 'Sono';
    return `Sono ${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`;
  }
  if (type === 'activity.steps') {
    return `Passos ${Number(payload.steps).toLocaleString('pt-BR')}`;
  }
  return JSON.stringify(payload);
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  container: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl },
  method: { color: colors.primary, fontSize: font.size.sm, textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: font.size.xl, fontWeight: font.weight.semibold },
  body: { color: colors.text, fontSize: font.size.md, lineHeight: 22 },
  meta: { color: colors.textMuted, fontSize: font.size.sm },
  section: {
    color: colors.text,
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    marginTop: spacing.md,
  },
  evidence: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 4,
  },
  evidenceType: { color: colors.textMuted, fontSize: font.size.sm },
  evidenceSummary: { color: colors.text, fontSize: font.size.md },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: { color: colors.primaryText, fontWeight: font.weight.semibold },
  buttonSecondary: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonSecondaryText: { color: colors.textMuted },
});
