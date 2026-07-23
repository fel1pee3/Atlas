import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getLocalTimeline } from '../../src/features/events/events.service';
import {
  syncNow,
  fetchDailySummary,
  type DailySummary,
} from '../../src/features/sync/sync.service';
import type { LocalEvent } from '../../src/db/schema';
import { colors, spacing, radius, font } from '../../src/theme';

/**
 * Timeline unificada + resumo "Hoje" (docs/20_MVP.md §2.3, docs/11 §5.1).
 * Lê do banco LOCAL (offline-first); no foco/refresh roda sync (health + push/pull).
 */
export default function TimelineScreen() {
  const router = useRouter();
  const [items, setItems] = useState<LocalEvent[]>([]);
  const [daily, setDaily] = useState<DailySummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const loadLocal = useCallback(async () => {
    setItems(await getLocalTimeline());
  }, []);

  const loadDaily = useCallback(async () => {
    try {
      setDaily(await fetchDailySummary());
    } catch {
      // Offline: mantém o último resumo conhecido (ou null).
    }
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      await syncNow();
      setSyncError(null);
    } catch (err) {
      // Sem rede: timeline local permanece utilizável — mas avisamos (M8).
      setSyncError(err instanceof Error ? err.message : 'Sync falhou');
    }
    await loadLocal();
    await loadDaily();
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
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <>
            {syncError ? (
              <Text style={styles.syncWarn}>Sync: {syncError} (timeline local ok)</Text>
            ) : null}
            <TodaySummary
              daily={daily}
              onOpenHealth={() => router.push('/(app)/health')}
              onOpenSources={() => router.push('/(app)/sources')}
              onOpenInsights={() => router.push('/(app)/insights')}
              onOpenSearch={() => router.push('/(app)/search')}
              onOpenSettings={() => router.push('/(app)/settings')}
            />
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Sua timeline está vazia</Text>
            <Text style={styles.emptyText}>
              Conecte a Saúde ou toque em “+” para registrar nota, humor ou gasto.
            </Text>
          </View>
        }
        renderItem={({ item }) => <EventRow event={item} />}
      />

      <View style={styles.footer}>
        <Pressable onPress={() => router.push('/(app)/settings')}>
          <Text style={styles.logout}>Ajustes</Text>
        </Pressable>
        <Pressable
          style={styles.fab}
          onPress={() => router.push('/(app)/add')}
          accessibilityRole="button"
          accessibilityLabel="Registrar evento"
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatSleep(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

function TodaySummary({
  daily,
  onOpenHealth,
  onOpenSources,
  onOpenInsights,
  onOpenSearch,
  onOpenSettings,
}: {
  daily: DailySummary | null;
  onOpenHealth: () => void;
  onOpenSources: () => void;
  onOpenInsights: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <View style={styles.today}>
      <View style={styles.todayHeader}>
        <Text style={styles.todayTitle}>Hoje</Text>
        <View style={styles.todayLinks}>
          <Pressable onPress={onOpenSearch}>
            <Text style={styles.healthLink}>Busca</Text>
          </Pressable>
          <Pressable onPress={onOpenInsights}>
            <Text style={styles.healthLink}>Insights</Text>
          </Pressable>
          <Pressable onPress={onOpenHealth}>
            <Text style={styles.healthLink}>Saúde</Text>
          </Pressable>
          <Pressable onPress={onOpenSources}>
            <Text style={styles.healthLink}>Fontes</Text>
          </Pressable>
          <Pressable onPress={onOpenSettings}>
            <Text style={styles.healthLink}>Ajustes</Text>
          </Pressable>
        </View>
      </View>
      {!daily ? (
        <Text style={styles.todayMuted}>Sincronize para ver o resumo do dia.</Text>
      ) : (
        <>
          <Text style={styles.todayLine}>
            {daily.sleep
              ? `Sono ${formatSleep(daily.sleep.totalDurationMin)}`
              : 'Sem sono registrado'}
          </Text>
          <Text style={styles.todayLine}>
            {daily.activity
              ? `Passos ${daily.activity.totalSteps.toLocaleString('pt-BR')}`
              : 'Sem passos registrados'}
          </Text>
          <Text style={styles.todayLine}>
            {daily.places
              ? `Visitas ${daily.places.visitCount} · ${formatSleep(daily.places.totalDurationMin)}`
              : 'Sem visitas registradas'}
          </Text>
          <Text style={styles.todayLine}>
            {daily.calendar
              ? `Agenda ${daily.calendar.eventCount} eventos`
              : 'Sem eventos na agenda'}
          </Text>
          <Text style={styles.todayLine}>
            {daily.mood?.avgScore != null
              ? `Humor médio ${daily.mood.avgScore.toFixed(1)}/5`
              : 'Sem humor registrado'}
          </Text>
          <Text style={styles.todayLine}>
            {daily.expense
              ? `Gastos ${daily.expense.currency} ${daily.expense.totalAmount.toLocaleString(
                  'pt-BR',
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                )}`
              : 'Sem gastos registrados'}
          </Text>
        </>
      )}
    </View>
  );
}

function EventRow({ event }: { event: LocalEvent }) {
  const payload = JSON.parse(event.payload) as Record<string, unknown>;
  const summary = summarize(event.type, payload);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardType}>{event.type}</Text>
        {event.syncState === 'pending' ? <Text style={styles.pending}>• pendente</Text> : null}
      </View>
      <Text style={styles.cardSummary}>{summary}</Text>
      <Text style={styles.cardTime}>{new Date(event.occurredAt).toLocaleString()}</Text>
    </View>
  );
}

function summarize(type: string, payload: Record<string, unknown>): string {
  switch (type) {
    case 'manual.note':
      return String(payload.text ?? '');
    case 'manual.mood':
      return `Humor: ${payload.score}/5`;
    case 'manual.expense': {
      const amount = payload.amount;
      const formatted =
        typeof amount === 'number' && Number.isFinite(amount)
          ? amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : '—';
      return `Gasto: R$ ${formatted}`;
    }
    case 'sleep.recorded': {
      const min = Number(payload.durationMin);
      if (!Number.isFinite(min)) return 'Sono';
      const h = Math.floor(min / 60);
      const m = min % 60;
      return `Sono: ${h}h${m.toString().padStart(2, '0')}`;
    }
    case 'activity.steps':
      return `Passos: ${Number(payload.steps).toLocaleString('pt-BR')}`;
    case 'activity.workout':
      return `Treino: ${String(payload.kind ?? 'atividade')} (${payload.durationMin} min)`;
    case 'location.visited':
      return `Visita: ${String(payload.label ?? `${payload.lat}, ${payload.lng}`)}`;
    case 'calendar.event':
      return `Agenda: ${String(payload.title ?? 'evento')}`;
    default:
      return JSON.stringify(payload);
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.md, paddingBottom: 100, gap: spacing.sm, flexGrow: 1 },
  syncWarn: {
    color: colors.danger,
    fontSize: font.size.sm,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  today: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  todayLinks: { flexDirection: 'row', gap: spacing.md },
  todayTitle: { color: colors.text, fontSize: font.size.lg, fontWeight: font.weight.semibold },
  healthLink: { color: colors.primary, fontSize: font.size.sm, fontWeight: font.weight.medium },
  todayLine: { color: colors.text, fontSize: font.size.md },
  todayMuted: { color: colors.textMuted, fontSize: font.size.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardType: { color: colors.textMuted, fontSize: font.size.sm },
  pending: { color: colors.primary, fontSize: font.size.sm },
  cardSummary: { color: colors.text, fontSize: font.size.md, marginTop: spacing.xs },
  cardTime: { color: colors.textMuted, fontSize: font.size.sm, marginTop: spacing.xs },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: { color: colors.text, fontSize: font.size.lg, fontWeight: font.weight.semibold },
  emptyText: { color: colors.textMuted, textAlign: 'center' },
  footer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },
  logout: { color: colors.textMuted },
  fab: {
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: colors.primaryText, fontSize: 28, lineHeight: 30 },
});
