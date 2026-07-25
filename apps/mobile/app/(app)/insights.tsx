import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  generateInsights,
  listInsights,
  type InsightListItem,
} from '../../src/features/insights/insights.service';
import { isCrossDomainKind } from '@atlas/shared';
import { isAbortLikeError } from '../../src/lib/api';
import { colors, spacing, radius, font } from '../../src/theme';

/**
 * Feed de insights (docs/19 §7). Gera sob demanda no foco/refresh (MVP sem worker).
 */
export default function InsightsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<InsightListItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (regen: boolean) => {
    setError(null);
    try {
      // Lista primeiro (rápido); generate depois — se generate timeout, ainda vemos o que já existe.
      setItems(await listInsights());
      setLoading(false);
      if (regen) {
        try {
          const gen = await generateInsights();
          if (gen.items?.length) setItems(gen.items);
          else setItems(await listInsights());
        } catch (err) {
          if (isAbortLikeError(err)) {
            setError('Geração demorou (rede). Lista atual mantida — puxe para tentar de novo.');
          } else {
            setError(err instanceof Error ? err.message : 'Falha ao gerar insights');
          }
        }
      }
    } catch (err) {
      setError(
        isAbortLikeError(err)
          ? 'Rede lenta ao carregar insights. Puxe para tentar de novo.'
          : err instanceof Error
            ? err.message
            : 'Falha ao carregar insights',
      );
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load(true);
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(it) => it.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      ListHeaderComponent={
        <Text style={styles.lead}>
          Insights heurísticos (intra e cross-domain) com evidências. Sem LLM. Cross-domain =
          a prova da tese do Atlas.
        </Text>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Ainda observando</Text>
          <Text style={styles.emptyText}>
            {error ??
              'Conecte Saúde + Fontes (Demo) e volte aqui. Os padrões cross-domain precisam de alguns dias de dados.'}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          style={[styles.card, isCrossDomainKind(item.kind) && styles.cardCross]}
          onPress={() => router.push(`/(app)/insight/${item.id}`)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.method}>
              {isCrossDomainKind(item.kind) ? 'cross-domain' : item.method}
            </Text>
            {item.status === 'useful' ? <Text style={styles.useful}>útil</Text> : null}
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body} numberOfLines={3}>
            {item.body}
          </Text>
          <Text style={styles.meta}>
            {item.evidence.length} evidência{item.evidence.length === 1 ? '' : 's'}
            {item.confidence != null ? ` · confiança ${(item.confidence * 100).toFixed(0)}%` : ''}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1, backgroundColor: colors.bg },
  lead: { color: colors.textMuted, fontSize: font.size.sm, marginBottom: spacing.sm, lineHeight: 18 },
  empty: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  emptyTitle: { color: colors.text, fontSize: font.size.lg, fontWeight: font.weight.semibold },
  emptyText: { color: colors.textMuted, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardCross: { borderColor: colors.primary },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  method: { color: colors.primary, fontSize: font.size.sm, textTransform: 'uppercase' },
  useful: { color: colors.success, fontSize: font.size.sm },
  title: { color: colors.text, fontSize: font.size.lg, fontWeight: font.weight.semibold },
  body: { color: colors.textMuted, fontSize: font.size.md, lineHeight: 20 },
  meta: { color: colors.textMuted, fontSize: font.size.sm, marginTop: spacing.xs },
});
