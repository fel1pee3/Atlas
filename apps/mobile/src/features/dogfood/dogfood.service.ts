import { getMeta, setMeta } from '../../db/meta';
import { api } from '../../lib/api';

const META_OPENS = 'dogfood.open.days'; // JSON string[] ISO dates YYYY-MM-DD
const META_LAST_OPEN = 'dogfood.last.open';

export interface AccountStats {
  usefulThisWeek: number;
  usefulTotal: number;
  activeInsights: number;
  dismissedTotal: number;
  eventsTotal: number;
  weekStart: string;
  northStarMet: boolean;
}

export interface DogfoodSnapshot {
  streakDays: number;
  openDaysTotal: number;
  lastOpenDay: string | null;
  stats: AccountStats | null;
  statsError: string | null;
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function prevDay(day: string): string {
  const d = new Date(`${day}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Registra abertura do app (proxy do gate D8 — streak local). */
export async function recordAppOpen(): Promise<void> {
  const day = todayUtc();
  const last = await getMeta(META_LAST_OPEN);
  if (last === day) return;

  const raw = (await getMeta(META_OPENS)) ?? '[]';
  let days: string[] = [];
  try {
    days = JSON.parse(raw) as string[];
  } catch {
    days = [];
  }
  if (!days.includes(day)) {
    days.push(day);
    days.sort();
    // Mantém ~120 dias para não crescer sem limite.
    if (days.length > 120) days = days.slice(-120);
    await setMeta(META_OPENS, JSON.stringify(days));
  }
  await setMeta(META_LAST_OPEN, day);
}

export async function getStreakDays(): Promise<{ streak: number; total: number; last: string | null }> {
  const raw = (await getMeta(META_OPENS)) ?? '[]';
  let days: string[] = [];
  try {
    days = JSON.parse(raw) as string[];
  } catch {
    days = [];
  }
  const set = new Set(days);
  const last = (await getMeta(META_LAST_OPEN)) ?? null;
  let streak = 0;
  let cursor = todayUtc();
  // Se não abriu hoje, streak conta a partir de ontem (ainda válido no mesmo dia civil UTC).
  if (!set.has(cursor)) {
    cursor = prevDay(cursor);
  }
  while (set.has(cursor)) {
    streak += 1;
    cursor = prevDay(cursor);
  }
  return { streak, total: set.size, last };
}

export async function fetchAccountStats(): Promise<AccountStats> {
  return api.get<AccountStats>('/account/stats');
}

export async function loadDogfoodSnapshot(): Promise<DogfoodSnapshot> {
  const { streak, total, last } = await getStreakDays();
  try {
    const stats = await fetchAccountStats();
    return {
      streakDays: streak,
      openDaysTotal: total,
      lastOpenDay: last,
      stats,
      statsError: null,
    };
  } catch (err) {
    return {
      streakDays: streak,
      openDaysTotal: total,
      lastOpenDay: last,
      stats: null,
      statsError: err instanceof Error ? err.message : 'Falha ao carregar stats',
    };
  }
}
