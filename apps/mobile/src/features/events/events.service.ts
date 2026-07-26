import * as Crypto from 'expo-crypto';
import { desc, eq } from 'drizzle-orm';
import { EVENT_SOURCES } from '@atlas/shared';
import { getDb } from '../../db/client';
import { events, type LocalEvent } from '../../db/schema';
import { api } from '../../lib/api';

/**
 * Serviço de eventos no device (offline-first, docs/08 §offline + §sync).
 * Escreve SEMPRE local primeiro (fonte primária); depois tenta empurrar ao
 * backend. Se estiver offline, fica 'pending' e o sync engine reenvia.
 */

export interface AddEventInput {
  type: string;
  source: string;
  occurredAt: string; // ISO
  payload: Record<string, unknown>;
}

export interface AddEventLocalInput extends AddEventInput {
  /** Id estável (ex.: externalId do Health) — se omitido, gera UUID. */
  id?: string;
}

export async function addEvent(input: AddEventInput): Promise<LocalEvent> {
  const saved = await addEventLocal(input);
  // Offline-first: UI não espera a API (no celular o POST podia travar minutos).
  void pushOne(saved.row).catch(() => undefined);
  return saved.row;
}

async function pushOne(row: LocalEvent): Promise<void> {
  const res = await api.post<{ created: boolean; event: { id: string } }>(
    '/events',
    {
      type: row.type,
      source: row.source,
      externalId: row.id,
      occurredAt: row.occurredAt,
      payload: JSON.parse(row.payload) as Record<string, unknown>,
    },
    { timeoutMs: api.timeouts.default },
  );
  await getDb()
    .update(events)
    .set({ serverId: res.event.id, syncState: 'synced' })
    .where(eq(events.id, row.id));
}

/**
 * Insere local sem push. Idempotente por `id` (não duplica se já existe).
 * Usado pela ingestão retroativa do conector de saúde (M2).
 */
export async function addEventLocal(
  input: AddEventLocalInput,
): Promise<{ row: LocalEvent; inserted: boolean }> {
  const id = input.id ?? Crypto.randomUUID();
  const db = getDb();
  const existing = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (existing[0]) {
    return { row: existing[0], inserted: false };
  }

  const row = {
    id,
    type: input.type,
    source: input.source,
    occurredAt: input.occurredAt,
    payload: JSON.stringify(input.payload),
    serverId: null as string | null,
    syncState: 'pending',
    createdAt: Date.now(),
  };
  await db.insert(events).values(row);
  return { row, inserted: true };
}

export async function getLocalTimeline(limit = 100): Promise<LocalEvent[]> {
  return getDb().select().from(events).orderBy(desc(events.occurredAt)).limit(limit);
}

/** Reenvia eventos pendentes um a um (fallback). */
export async function pushPending(): Promise<number> {
  return pushPendingBatch();
}

/**
 * Push em lote via POST /events/batch (docs/17 §4.2).
 * Chunks menores + sem fallback unitário em massa (evita storm após 499 no celular).
 */
export async function pushPendingBatch(): Promise<number> {
  const db = getDb();
  const pending = await db.select().from(events).where(eq(events.syncState, 'pending'));
  if (pending.length === 0) return 0;

  let sent = 0;
  const chunkSize = 25;
  for (let i = 0; i < pending.length; i += chunkSize) {
    const chunk = pending.slice(i, i + chunkSize);
    try {
      const res = await api.post<{
        items: Array<{ created: boolean; event: { id: string } }>;
      }>(
        '/events/batch',
        {
          events: chunk.map((ev) => ({
            type: ev.type,
            source: ev.source,
            externalId: ev.id,
            occurredAt: ev.occurredAt,
            payload: JSON.parse(ev.payload) as Record<string, unknown>,
          })),
        },
        { timeoutMs: api.timeouts.batch },
      );

      for (let j = 0; j < chunk.length; j += 1) {
        const serverEvent = res.items[j]?.event;
        if (!serverEvent) continue;
        await db
          .update(events)
          .set({ serverId: serverEvent.id, syncState: 'synced' })
          .where(eq(events.id, chunk[j].id));
        sent += 1;
      }
    } catch {
      // Mantém o chunk pendente para o próximo sync — não dispara N POSTs unitários.
    }
  }
  return sent;
}

/** Remove eventos locais com source=demo (dados fictícios do Expo Go). */
export async function purgeDemoLocalEvents(): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.source, EVENT_SOURCES.DEMO));
  for (const row of rows) {
    await db.delete(events).where(eq(events.id, row.id));
  }
  return rows.length;
}
