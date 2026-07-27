import { eq } from 'drizzle-orm';
import { EVENT_SOURCES } from '@atlas/shared';
import { getDb } from '../../db/client';
import { syncMeta } from '../../db/schema';
import { addEventLocal, pushPendingBatch } from '../events/events.service';
import { startOfUtcDayIso } from '../sync/connection-day';
import type { CalendarConnector } from './calendar.connector';
import { resolveCalendarConnector } from './resolve-connector';

const META_ENABLED = 'calendar.enabled';
const META_CONNECTOR = 'calendar.connector.id';
const META_CURSOR = 'calendar.pull.cursor';
const META_CONNECTED_SINCE = 'calendar.connected.since';

async function getMeta(key: string): Promise<string | undefined> {
  const rows = await getDb().select().from(syncMeta).where(eq(syncMeta.key, key)).limit(1);
  return rows[0]?.value;
}

async function setMeta(key: string, value: string): Promise<void> {
  const db = getDb();
  const existing = await db.select().from(syncMeta).where(eq(syncMeta.key, key)).limit(1);
  if (existing.length > 0) {
    await db.update(syncMeta).set({ value }).where(eq(syncMeta.key, key));
  } else {
    await db.insert(syncMeta).values({ key, value });
  }
}

/** Piso permanente: início do dia UTC da conexão (legado sem meta → hoje). */
async function ensureConnectedSince(): Promise<string> {
  const existing = await getMeta(META_CONNECTED_SINCE);
  if (existing) return existing;
  const since = startOfUtcDayIso();
  await setMeta(META_CONNECTED_SINCE, since);
  return since;
}

export async function isCalendarEnabled(): Promise<boolean> {
  return (await getMeta(META_ENABLED)) === '1';
}

export async function getActiveCalendarConnectorId(): Promise<string | null> {
  return (await getMeta(META_CONNECTOR)) ?? null;
}

export async function enableCalendar(
  connector: CalendarConnector,
): Promise<{ granted: boolean }> {
  if (!(await connector.isAvailable())) return { granted: false };
  const { granted } = await connector.requestPermissions();
  if (!granted) return { granted: false };
  await setMeta(META_ENABLED, '1');
  await setMeta(META_CONNECTOR, connector.id);
  const connectedSince = await ensureConnectedSince();
  if (!(await getMeta(META_CURSOR))) {
    await setMeta(META_CURSOR, connectedSince);
  }
  return { granted: true };
}

export async function disableCalendar(): Promise<void> {
  await setMeta(META_ENABLED, '0');
}

function sourceFor(connector: CalendarConnector): string {
  if (connector.id === 'device_calendar') return EVENT_SOURCES.DEVICE_CALENDAR;
  if (connector.id === 'google_calendar') return EVENT_SOURCES.GOOGLE_CALENDAR;
  if (connector.id === 'apple_calendar') return EVENT_SOURCES.APPLE_CALENDAR;
  return EVENT_SOURCES.DEMO;
}

export type CalendarSyncResult = {
  imported: number;
  pushed: number;
  /** Quantos compromissos a agenda do aparelho devolveu nesta leitura. */
  pulled: number;
  /** Títulos lidos (para o usuário conferir). */
  titles: string[];
};

/**
 * Relê a janela a partir do dia da conexão → +14d (captura eventos novos/alterados).
 * Não olha o passado anterior à conexão; eventos já gravados não são apagados.
 */
export async function syncCalendarNow(
  connector: CalendarConnector = resolveCalendarConnector(),
): Promise<CalendarSyncResult> {
  if (!(await isCalendarEnabled())) {
    return { imported: 0, pushed: 0, pulled: 0, titles: [] };
  }

  const windowStart = await ensureConnectedSince();
  const { samples } = await connector.pullSince(windowStart);
  const source = sourceFor(connector);
  let imported = 0;
  for (const sample of samples) {
    const result = await addEventLocal({
      id: sample.externalId,
      type: sample.type,
      source,
      occurredAt: sample.occurredAt,
      payload: sample.payload,
    });
    if (result.inserted) imported += 1;
  }

  // M5 dogfooding: Demo semeia gastos correlacionados à densidade da agenda.
  if (connector.id === 'demo') {
    imported += await seedDemoExpensesFromCalendar(samples);
  }

  await setMeta(META_CURSOR, new Date().toISOString());
  await setMeta(META_CONNECTOR, connector.id);
  void pushPendingBatch().catch(() => undefined);

  const titles = samples
    .map((s) => String(s.payload.title ?? '').trim())
    .filter(Boolean)
    .slice(0, 5);

  return { imported, pushed: 0, pulled: samples.length, titles };
}

/** Gastos sintéticos alinhados aos dias da agenda (explicáveis via source=demo). */
async function seedDemoExpensesFromCalendar(
  samples: Array<{ occurredAt: string; payload: { title?: string } }>,
): Promise<number> {
  const byDay = new Map<string, number>();
  for (const s of samples) {
    const day = s.occurredAt.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  let inserted = 0;
  for (const [day, meetingCount] of byDay) {
    const busy = meetingCount > 4;
    const amount = busy ? 90 + meetingCount * 18 : 35 + (meetingCount % 5) * 8;
    const result = await addEventLocal({
      id: `demo:expense:${day}`,
      type: 'manual.expense',
      source: EVENT_SOURCES.DEMO,
      occurredAt: `${day}T19:30:00.000Z`,
      payload: {
        amount,
        currency: 'BRL',
        category: busy ? 'delivery' : 'cafe',
        note: busy ? 'Dia cheio de reuniões (demo)' : 'Dia leve (demo)',
      },
    });
    if (result.inserted) inserted += 1;
  }
  return inserted;
}
