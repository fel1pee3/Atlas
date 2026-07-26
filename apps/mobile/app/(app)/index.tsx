import { useCallback, useMemo, useState } from 'react';
import { View, FlatList, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getLocalTimeline } from '../../src/features/events/events.service';
import {
  syncNow,
  fetchDailySummary,
  type DailySummary,
} from '../../src/features/sync/sync.service';
import type { LocalEvent } from '../../src/db/schema';
import { isAbortLikeError } from '../../src/lib/api';
import {
  eventKindLabel,
  formatEventWhen,
  formatSleep,
  summarizeEvent,
} from '../../src/lib/humanize';
import { colors, spacing, font, shadow } from '../../src/theme';
import { Screen, Title, Body, Caption, Label } from '../../src/ui';

/**
 * Timeline unificada + resumo "Hoje" (docs/20_MVP.md §2.3, docs/11 §5.1).
 * Lê do banco LOCAL (offline-first); no foco/refresh roda sync (health + push/pull).
 */
export default function TimelineScreen() {
  const router = useRouter();
  const [items, setItems] = useState<LocalEvent[]>([]);
  const [daily, setDaily] = useState<DailySummary | null>(null);
  const [dailyOk, setDailyOk] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const loadLocal = useCallback(async () => {
    setItems(await getLocalTimeline());
  }, []);

  const loadDaily = useCallback(async () => {
    try {
      setDaily(await fetchDailySummary());
      setDailyOk(true);
    } catch {
      // Mantém último resumo; dailyOk fica false só se nunca carregou.
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await loadLocal();
    await loadDaily();
    try {
      await syncNow();
      setSyncError(null);
      await loadLocal();
      await loadDaily();
    } catch (err) {
      if (isAbortLikeError(err)) {
        setSyncError('Rede lenta — timeline local ok; puxe para tentar de novo');
      } else {
        setSyncError(err instanceof Error ? err.message : 'Sync falhou');
      }
      await loadDaily();
    }
  }, [loadLocal, loadDaily]);

  useFocusEffect(
    useCallback(() => {
      void refreshAll();
    }, [refreshAll]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);

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
          <>
            {syncError ? (
              <Caption tone="danger" style={styles.syncWarn}>
                Sync: {syncError} (timeline local ok)
              </Caption>
            ) : null}
            <TodaySummary daily={daily} dailyOk={dailyOk} />
            {items.length > 0 ? (
              <Title style={styles.timelineTitle}>Timeline</Title>
            ) : null}
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Title style={styles.emptyTitle}>Nada por aqui ainda</Title>
            <Body tone="muted" style={styles.emptyText}>
              Conecte a Saúde ou toque em + para registrar uma nota, humor ou gasto.
            </Body>
          </View>
        }
        renderItem={({ item }) => <EventRow event={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Pressable
        style={styles.fab}
        onPress={() => router.push('/(app)/add')}
        accessibilityRole="button"
        accessibilityLabel="Registrar evento"
      >
        <Label style={styles.fabText}>+</Label>
      </Pressable>
    </Screen>
  );
}

function formatTodayDate(d = new Date()): string {
  const raw = d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

type Metric = { key: string; label: string; value: string };

function buildTodayMetrics(daily: DailySummary): Metric[] {
  const metrics: Metric[] = [];
  if (daily.sleep) {
    metrics.push({
      key: 'sleep',
      label: 'Sono',
      value: formatSleep(daily.sleep.totalDurationMin),
    });
  }
  if (daily.activity) {
    metrics.push({
      key: 'steps',
      label: 'Passos',
      value: daily.activity.totalSteps.toLocaleString('pt-BR'),
    });
  }
  if (daily.places) {
    metrics.push({
      key: 'places',
      label: 'Visitas',
      value: String(daily.places.visitCount),
    });
  }
  if (daily.calendar) {
    metrics.push({
      key: 'calendar',
      label: 'Agenda',
      value:
        daily.calendar.eventCount === 1
          ? '1 evento'
          : `${daily.calendar.eventCount} eventos`,
    });
  }
  if (daily.mood?.avgScore != null) {
    metrics.push({
      key: 'mood',
      label: 'Humor',
      value: `${daily.mood.avgScore.toFixed(1).replace('.', ',')}/5`,
    });
  }
  if (daily.expense) {
    metrics.push({
      key: 'expense',
      label: 'Gastos',
      value: `R$ ${daily.expense.totalAmount.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    });
  }
  return metrics;
}

/** Resumo do dia em estilo ledger — tipografia, sem chips. */
function TodaySummary({
  daily,
  dailyOk,
}: {
  daily: DailySummary | null;
  dailyOk: boolean;
}) {
  const metrics = useMemo(
    () => (dailyOk && daily ? buildTodayMetrics(daily) : []),
    [daily, dailyOk],
  );

  return (
    <View style={styles.today}>
      <Title style={styles.todayTitle}>Hoje</Title>
      <Caption style={styles.todayDate}>{formatTodayDate()}</Caption>

      {!dailyOk ? (
        <Caption style={styles.todayHint}>Puxe para atualizar o dia.</Caption>
      ) : metrics.length === 0 ? (
        <Caption style={styles.todayHint}>
          Ainda sem sinais — registre ou sincronize para preencher o dia.
        </Caption>
      ) : (
        <View style={styles.ledger}>
          {metrics.map((m, i) => (
            <View
              key={m.key}
              style={[styles.ledgerRow, i === metrics.length - 1 && styles.ledgerRowLast]}
            >
              <Caption style={styles.ledgerLabel}>{m.label}</Caption>
              <Label style={styles.ledgerValue}>{m.value}</Label>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function EventRow({ event }: { event: LocalEvent }) {
  const payload = JSON.parse(event.payload) as Record<string, unknown>;
  const summary = summarizeEvent(event.type, payload);

  return (
    <View style={styles.event}>
      <View style={styles.eventMeta}>
        <Caption style={styles.eventKind}>{eventKindLabel(event.type)}</Caption>
        <Caption style={styles.eventTime}>{formatEventWhen(event.occurredAt)}</Caption>
        {event.syncState === 'pending' ? (
          <Caption tone="primary">pendente</Caption>
        ) : null}
      </View>
      <Body style={styles.eventSummary}>{summary}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 110,
    flexGrow: 1,
  },
  syncWarn: { marginBottom: spacing.md, lineHeight: 18 },
  today: {
    marginBottom: spacing.xl,
  },
  todayTitle: {
    fontSize: font.size.xxl,
    fontFamily: font.family.serifBold,
    letterSpacing: -0.6,
    marginBottom: 2,
  },
  todayDate: {
    marginBottom: spacing.lg,
    fontSize: font.size.sm,
  },
  todayHint: {
    lineHeight: 20,
    maxWidth: 320,
  },
  ledger: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingVertical: spacing.md - 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  ledgerRowLast: {},
  ledgerLabel: {
    fontSize: font.size.sm,
    color: colors.textMuted,
    fontFamily: font.family.sans,
  },
  ledgerValue: {
    fontSize: font.size.lg,
    fontFamily: font.family.serif,
    color: colors.text,
    letterSpacing: -0.2,
  },
  timelineTitle: {
    fontSize: font.size.xl,
    fontFamily: font.family.serif,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  event: {
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  eventKind: {
    fontFamily: font.family.sansMedium,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
  },
  eventTime: {
    color: colors.textMuted,
    fontSize: font.size.sm,
  },
  eventSummary: {
    fontSize: font.size.md,
    lineHeight: 22,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
  },

  empty: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  emptyTitle: { fontSize: font.size.lg },
  emptyText: { lineHeight: 22, maxWidth: 280 },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...shadow.card,
    elevation: 4,
  },
  fabText: {
    color: colors.primaryText,
    fontSize: 26,
    lineHeight: 28,
    fontFamily: font.family.sans,
  },
});
