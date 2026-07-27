import { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  generateInsights,
  listInsights,
  type InsightListItem,
} from '../../src/features/insights/insights.service';
import { fetchDailySummary } from '../../src/features/sync/sync.service';
import { useOnboarding } from '../../src/features/onboarding/onboarding.store';
import { colors, spacing, font, shadow } from '../../src/theme';
import { Screen, Body, Caption, Button } from '../../src/ui';
import { insightThemeLabel } from '../../src/lib/humanize';

/**
 * Primeiro "aha" — visual do protótipo + insight real quando houver.
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

  const cardTitle = insight?.title ?? 'Você está no ar';
  const cardBody = insight?.body ?? fallback ?? 'Timeline populada. Abra Insights depois para ver padrões.';
  const eyebrow = insight ? insightThemeLabel(insight.kind) : 'Atlas';

  return (
    <Screen padded={false} safe={false}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <View style={styles.copy}>
          <Body style={styles.title}>Primeiro insight</Body>
          <Caption style={styles.lead}>Uma observação a partir dos seus dados</Caption>

          <View style={styles.card}>
            <Caption tone="primary" style={styles.eyebrow}>
              {eyebrow}
            </Caption>
            <Body style={styles.cardTitle}>{cardTitle}</Body>
            <Body tone="muted" style={styles.cardBody}>
              {cardBody}
            </Body>
            {error ? <Caption tone="danger">{error}</Caption> : null}
          </View>

          <Body tone="muted" style={styles.hint}>
            Próximo passo opcional: registre o humor de hoje (+) para semear correlações.
          </Body>

          <Button label="Ir para o Atlas" onPress={() => void finish()} style={styles.primaryBtn} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  copy: {
    flexShrink: 0,
  },
  title: {
    fontFamily: font.family.serifBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1,
  },
  lead: {
    marginTop: spacing.md,
    fontSize: font.size.lg,
    lineHeight: 24,
  },
  card: {
    marginVertical: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  eyebrow: {
    marginBottom: spacing.sm,
    fontFamily: font.family.sansSemi,
    fontSize: font.size.sm,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontFamily: font.family.serifBold,
    fontSize: font.size.xl,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
    lineHeight: 30,
  },
  cardBody: {
    fontSize: font.size.lg,
    lineHeight: 26,
  },
  hint: {
    marginBottom: spacing.xl,
    fontSize: font.size.lg,
    lineHeight: 26,
  },
  primaryBtn: {
    ...shadow.card,
  },
});
