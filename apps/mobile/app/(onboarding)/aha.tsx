import { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  generateInsights,
  listInsights,
  type InsightListItem,
} from '../../src/features/insights/insights.service';
import { fetchDailySummary } from '../../src/features/sync/sync.service';
import { useOnboarding } from '../../src/features/onboarding/onboarding.store';
import { colors, spacing, font } from '../../src/theme';
import { insightThemeLabel } from '../../src/lib/humanize';
import { Screen, Title, Body, Caption, Button, EntryRow, Hairline } from '../../src/ui';

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
      <Screen style={styles.center} safe={false}>
        <ActivityIndicator color={colors.primary} />
        <Caption>Gerando sua primeira observação…</Caption>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container} safe={false}>
      <Title style={styles.title}>Primeiro insight</Title>
      <Caption style={styles.lead}>Uma observação a partir dos seus dados</Caption>

      <Hairline />
      {insight ? (
        <EntryRow kind={insightThemeLabel(insight.kind)}>
          <Body style={styles.itemTitle}>{insight.title}</Body>
          <Body tone="muted">{insight.body}</Body>
        </EntryRow>
      ) : (
        <EntryRow kind="atlas">
          <Body style={styles.itemTitle}>Você está no ar</Body>
          <Body tone="muted">{fallback}</Body>
          {error ? <Caption tone="danger">{error}</Caption> : null}
        </EntryRow>
      )}
      <Hairline />

      <Caption style={styles.hint}>
        Próximo passo opcional: registre o humor de hoje (+) para semear correlações.
      </Caption>

      <Button label="Ir para o Atlas" onPress={() => void finish()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  container: { justifyContent: 'center', paddingVertical: spacing.lg },
  title: {
    fontSize: font.size.xxl,
    fontFamily: font.family.serifBold,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  lead: { marginBottom: spacing.lg },
  itemTitle: {
    fontFamily: font.family.serif,
    fontSize: font.size.lg,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  hint: { marginTop: spacing.lg, marginBottom: spacing.lg, lineHeight: 20 },
});
