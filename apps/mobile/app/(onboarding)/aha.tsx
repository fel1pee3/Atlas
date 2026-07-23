import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  generateInsights,
  listInsights,
  type InsightListItem,
} from '../../src/features/insights/insights.service';
import { fetchDailySummary } from '../../src/features/sync/sync.service';
import { useOnboarding } from '../../src/features/onboarding/onboarding.store';
import { colors, spacing, radius, font } from '../../src/theme';

/**
 * Primeiro "aha" — insight heurístico ou resumo de sono (docs/20 §2.7).
 */
export default function OnboardingAha() {
  const router = useRouter();
  const complete = useOnboarding((s) => s.complete);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<InsightListItem | null>(null);
  const [fallback, setFallback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        await generateInsights();
        const items = await listInsights();
        if (items[0]) {
          setInsight(items[0]);
        } else {
          const daily = await fetchDailySummary();
          if (daily.sleep) {
            const h = Math.floor(daily.sleep.totalDurationMin / 60);
            const m = daily.sleep.totalDurationMin % 60;
            setFallback(`Sono de hoje (agregado): ${h}h${m.toString().padStart(2, '0')}.`);
          } else {
            setFallback('Timeline populada. Abra Insights depois para ver padrões.');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível gerar o insight');
        setFallback('Você já pode explorar a timeline — os insights aparecem com mais dados.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const finish = async () => {
    await complete();
    router.replace('/(app)');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.muted}>Gerando sua primeira observação…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Primeiro insight</Text>
      {insight ? (
        <View style={styles.card}>
          <Text style={styles.method}>{insight.method}</Text>
          <Text style={styles.title}>{insight.title}</Text>
          <Text style={styles.body}>{insight.body}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.title}>Você está no ar</Text>
          <Text style={styles.body}>{fallback}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      )}

      <Text style={styles.hint}>
        Próximo passo opcional: registre o humor de hoje (+) para semear correlações.
      </Text>

      <Pressable style={styles.primary} onPress={() => void finish()}>
        <Text style={styles.primaryText}>Ir para o Atlas</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  kicker: {
    color: colors.primary,
    fontSize: font.size.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  method: { color: colors.textMuted, fontSize: font.size.sm, marginBottom: 4 },
  title: { color: colors.text, fontSize: font.size.lg, fontWeight: '600', marginBottom: spacing.sm },
  body: { color: colors.text, lineHeight: 22, opacity: 0.9 },
  muted: { color: colors.textMuted },
  error: { color: colors.danger, marginTop: spacing.sm, fontSize: font.size.sm },
  hint: { color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 20 },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  primaryText: { color: colors.primaryText, fontWeight: '600' },
});
