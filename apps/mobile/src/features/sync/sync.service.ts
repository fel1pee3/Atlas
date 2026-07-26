import { eq } from 'drizzle-orm';
import { getDb } from '../../db/client';
import { events, syncMeta } from '../../db/schema';
import { api } from '../../lib/api';
import { pushPending } from '../events/events.service';
import { isHealthEnabled, syncHealthNow } from '../health/health.service';
import { isLocationEnabled, syncLocationNow } from '../location/location.service';
import { isCalendarEnabled, syncCalendarNow } from '../calendar/calendar.service';
import { decideMerge, type RemoteEventLike } from './merge-remote';

/**
 * Sync engine — pull incremental (docs/08_Mobile_Architecture.md §7.5).
 * Cursor = ingestedAt do servidor (eventos append-only; adaptado de updated_at).
 */

const CURSOR_KEY = 'events.pull.since';

export interface RemoteEvent extends RemoteEventLike {
  userId: string;
  ingestedAt: string;
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

  const byLocal = localId
    ? (await db.select().from(events).where(eq(events.id, localId)).limit(1))[0]
    : undefined;
  const byServer = (
    await db.select().from(events).where(eq(events.serverId, remote.id)).limit(1)
  )[0];

  const decision = decideMerge(remote, byLocal ?? null, byServer ?? null);

  if (decision.action === 'link') {
    if (decision.needsUpdate) {
      await db
        .update(events)
        .set({ serverId: remote.id, syncState: 'synced' })
        .where(eq(events.id, decision.localId));
    }
    return 'linked';
  }
  if (decision.action === 'skip') return 'skipped';

  await db.insert(events).values({
    id: decision.id,
    type: decision.type,
    source: decision.source,
    occurredAt: decision.occurredAt,
    payload: decision.payloadJson,
    serverId: decision.serverId,
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

type SyncResult = {
  pushed: number;
  pulled: number;
  healthImported: number;
  locationImported: number;
  calendarImported: number;
};

/** Evita syncs concorrentes (foco + pull-to-refresh) cancelando uns aos outros no RN. */
let syncInFlight: Promise<SyncResult> | null = null;

/** Ciclo completo: conectores → push → pull remoto (docs/08 §7–§8). */
export async function syncNow(): Promise<SyncResult> {
  if (syncInFlight) return syncInFlight;

  syncInFlight = (async (): Promise<SyncResult> => {
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
    // Push/pull isolados: falha de um não impede o outro nem o resumo do dia na UI.
    let pushed = 0;
    let pulled = 0;
    try {
      pushed = await pushPending();
    } catch {
      /* pending fica para o próximo ciclo */
    }
    try {
      pulled = await pullRemote();
    } catch {
      /* offline / timeout */
    }
    return { pushed, pulled, healthImported, locationImported, calendarImported };
  })().finally(() => {
    syncInFlight = null;
  });

  return syncInFlight;
}

/** Resumo diário do servidor (read models — docs/11 §5.1). */
export async function fetchDailySummary(day?: string): Promise<DailySummary> {
  const qs = day ? `?day=${encodeURIComponent(day)}` : '';
  return api.get<DailySummary>(`/events/daily${qs}`, { timeoutMs: api.timeouts.default });
}
