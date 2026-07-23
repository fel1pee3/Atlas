import { eq } from 'drizzle-orm';
import { getDb } from '../../db/client';
import { events, syncMeta } from '../../db/schema';
import { api } from '../../lib/api';
import { pushPending } from '../events/events.service';
import { isHealthEnabled, syncHealthNow } from '../health/health.service';
import { isLocationEnabled, syncLocationNow } from '../location/location.service';
import { isCalendarEnabled, syncCalendarNow } from '../calendar/calendar.service';

/**
 * Sync engine — pull incremental (docs/08_Mobile_Architecture.md §7.5).
 * Cursor = ingestedAt do servidor (eventos append-only; adaptado de updated_at).
 */

const CURSOR_KEY = 'events.pull.since';

export interface RemoteEvent {
  id: string;
  userId: string;
  type: string;
  source: string;
  externalId: string | null;
  occurredAt: string;
  ingestedAt: string;
  payload: Record<string, unknown>;
}

interface SyncPullPage {
  items: RemoteEvent[];
  nextSince: string | null;
  hasMore: boolean;
}

export interface DailySummary {
  day: string;
  mood: { day: string; count: number; avgScore: number | null } | null;
  expense: {
    day: string;
    count: number;
    totalAmount: number;
    currency: string;
  } | null;
  sleep: { day: string; count: number; totalDurationMin: number } | null;
  activity: { day: string; totalSteps: number; workoutCount: number } | null;
  places: { day: string; visitCount: number; totalDurationMin: number } | null;
  calendar: { day: string; eventCount: number; totalDurationMin: number } | null;
}

async function getCursor(): Promise<string | undefined> {
  const rows = await getDb().select().from(syncMeta).where(eq(syncMeta.key, CURSOR_KEY)).limit(1);
  return rows[0]?.value;
}

async function setCursor(value: string): Promise<void> {
  const db = getDb();
  const existing = await db.select().from(syncMeta).where(eq(syncMeta.key, CURSOR_KEY)).limit(1);
  if (existing.length > 0) {
    await db.update(syncMeta).set({ value }).where(eq(syncMeta.key, CURSOR_KEY));
  } else {
    await db.insert(syncMeta).values({ key: CURSOR_KEY, value });
  }
}

/**
 * Merge remoto → local sem duplicar (docs/08 §7.6 adaptado a eventos imutáveis).
 * Match por externalId (= id local) ou serverId; senão insere como synced.
 */
async function mergeRemote(remote: RemoteEvent): Promise<'inserted' | 'linked' | 'skipped'> {
  const db = getDb();
  const localId = remote.externalId;

  if (localId) {
    const byLocal = await db.select().from(events).where(eq(events.id, localId)).limit(1);
    if (byLocal[0]) {
      if (byLocal[0].serverId !== remote.id || byLocal[0].syncState !== 'synced') {
        await db
          .update(events)
          .set({ serverId: remote.id, syncState: 'synced' })
          .where(eq(events.id, localId));
      }
      return 'linked';
    }
  }

  const byServer = await db.select().from(events).where(eq(events.serverId, remote.id)).limit(1);
  if (byServer[0]) return 'skipped';

  const id = localId ?? remote.id;
  await db.insert(events).values({
    id,
    type: remote.type,
    source: remote.source,
    occurredAt:
      typeof remote.occurredAt === 'string'
        ? remote.occurredAt
        : new Date(remote.occurredAt).toISOString(),
    payload: JSON.stringify(remote.payload ?? {}),
    serverId: remote.id,
    syncState: 'synced',
    createdAt: Date.now(),
  });
  return 'inserted';
}

/** Puxa deltas do servidor até esgotar páginas. Retorna quantos eventos novos inseriu. */
export async function pullRemote(): Promise<number> {
  let since = await getCursor();
  let inserted = 0;
  let hasMore = true;

  while (hasMore) {
    const qs = new URLSearchParams();
    if (since) qs.set('since', since);
    qs.set('limit', '200');
    const page = await api.get<SyncPullPage>(`/events/sync?${qs.toString()}`);

    for (const remote of page.items) {
      // Normaliza datas se vierem como Date serializado pelo Nest
      const normalized: RemoteEvent = {
        ...remote,
        occurredAt:
          typeof remote.occurredAt === 'string'
            ? remote.occurredAt
            : new Date(remote.occurredAt as unknown as string).toISOString(),
        ingestedAt:
          typeof remote.ingestedAt === 'string'
            ? remote.ingestedAt
            : new Date(remote.ingestedAt as unknown as string).toISOString(),
      };
      const result = await mergeRemote(normalized);
      if (result === 'inserted') inserted += 1;
    }

    if (page.nextSince) {
      since = page.nextSince;
      await setCursor(page.nextSince);
    }
    hasMore = page.hasMore;
  }

  return inserted;
}

/** Ciclo completo: conectores → push → pull remoto (docs/08 §7–§8). */
export async function syncNow(): Promise<{
  pushed: number;
  pulled: number;
  healthImported: number;
  locationImported: number;
  calendarImported: number;
}> {
  let healthImported = 0;
  let locationImported = 0;
  let calendarImported = 0;
  try {
    if (await isHealthEnabled()) {
      healthImported = (await syncHealthNow()).imported;
    }
  } catch {
    /* ignore */
  }
  try {
    if (await isLocationEnabled()) {
      locationImported = (await syncLocationNow()).imported;
    }
  } catch {
    /* ignore */
  }
  try {
    if (await isCalendarEnabled()) {
      calendarImported = (await syncCalendarNow()).imported;
    }
  } catch {
    /* ignore */
  }
  const pushed = await pushPending();
  const pulled = await pullRemote();
  return { pushed, pulled, healthImported, locationImported, calendarImported };
}

/** Resumo diário do servidor (read models — docs/11 §5.1). */
export async function fetchDailySummary(day?: string): Promise<DailySummary> {
  const qs = day ? `?day=${encodeURIComponent(day)}` : '';
  return api.get<DailySummary>(`/events/daily${qs}`);
}
