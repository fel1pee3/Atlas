import { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  generateInsights,
  listInsights,
  type InsightListItem,
} from '../../src/features/insights/insights.service';
import { isAbortLikeError } from '../../src/lib/api';
import { insightListMeta, insightThemeLabel } from '../../src/lib/humanize';
import { colors, spacing, font } from '../../src/theme';
import {
  Screen,
  Title,
  Body,
  Caption,
  EntryRow,
  Hairline,
  pagePad,
} from '../../src/ui';

/**
 * Feed de insights (docs/19 §7).
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
      <Screen style={styles.center} safe={false} padded={false}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  return (
    <Screen padded={false} safe={false}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <Caption style={styles.lead}>
            Observações com evidências da sua timeline — sono, passos, agenda, humor e gastos.
          </Caption>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Title style={styles.emptyTitle}>Ainda observando</Title>
            <Body tone="muted" style={styles.emptyText}>
              {error ??
                'Conecte Saúde e Fontes. Os padrões precisam de alguns dias de dados.'}
            </Body>
          </View>
        }
        renderItem={({ item }) => (
          <EntryRow
            kind={insightThemeLabel(item.kind)}
            meta={insightListMeta(item.evidence.length, item.confidence)}
            trailing={item.status === 'useful' ? 'útil' : undefined}
            onPress={() => router.push(`/(app)/insight/${item.id}`)}
          >
            <Body style={styles.itemTitle}>{item.title}</Body>
            <Caption numberOfLines={3} style={styles.itemBody}>
              {item.body}
            </Caption>
          </EntryRow>
        )}
        ItemSeparatorComponent={() => <Hairline />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  list: { ...pagePad, flexGrow: 1 },
  lead: { marginBottom: spacing.md, lineHeight: 20 },
  empty: { paddingTop: spacing.xl, gap: spacing.sm },
  emptyTitle: { fontSize: font.size.lg },
  emptyText: { lineHeight: 22, maxWidth: 300 },
  itemTitle: {
    fontFamily: font.family.serif,
    fontSize: font.size.lg,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  itemBody: { lineHeight: 20 },
});
