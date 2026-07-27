import { eq } from 'drizzle-orm';
import { EVENT_SOURCES } from '@atlas/shared';
import { getDb } from '../../db/client';
import { syncMeta } from '../../db/schema';
import { addEventLocal, pushPendingBatch } from '../events/events.service';
import { laterIso, startOfUtcDayIso } from '../sync/connection-day';
import type { HealthConnector } from './health.connector';
import { resolveHealthConnector } from './resolve-connector';

/**
 * Orquestra o conector de saúde (docs/08 §10.3, docs/20 M2).
 * Fluxo: permissão → pull a partir do dia da conexão → grava local → push batch.
 * Dados já gravados não são apagados; syncs seguintes só avançam o cursor.
 */

const META_CONNECTOR = 'health.connector.id';
const META_CURSOR = 'health.pull.cursor';
const META_ENABLED = 'health.enabled';
const META_CONNECTED_SINCE = 'health.connected.since';

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

export async function isHealthEnabled(): Promise<boolean> {
  return (await getMeta(META_ENABLED)) === '1';
}

export async function getActiveConnectorId(): Promise<string | null> {
  return (await getMeta(META_CONNECTOR)) ?? null;
}

export async function enableHealth(connector: HealthConnector): Promise<{ granted: boolean }> {
  const available = await connector.isAvailable();
  if (!available) {
    return { granted: false };
  }
  const { granted } = await connector.requestPermissions(['sleep', 'steps']);
  if (!granted) return { granted: false };

  await setMeta(META_ENABLED, '1');
  await setMeta(META_CONNECTOR, connector.id);
  const connectedSince = await ensureConnectedSince();
  // Primeira sync: só a partir do dia da conexão (sem lookback).
  if (!(await getMeta(META_CURSOR))) {
    await setMeta(META_CURSOR, connectedSince);
  }
  return { granted: true };
}

export async function disableHealth(): Promise<void> {
  await setMeta(META_ENABLED, '0');
}

function sourceFor(connector: HealthConnector): string {
  if (connector.id === 'health_connect') return EVENT_SOURCES.HEALTH_CONNECT;
  if (connector.id === 'healthkit') return EVENT_SOURCES.HEALTHKIT;
  return EVENT_SOURCES.DEMO;
}

/**
 * Coleta incremental do conector → SQLite → push batch ao servidor.
 * Retorna quantas amostras novas foram gravadas localmente.
 */
export async function syncHealthNow(
  connector: HealthConnector = resolveHealthConnector(),
): Promise<{ imported: number; pushed: number }> {
  const enabled = await isHealthEnabled();
  if (!enabled) return { imported: 0, pushed: 0 };

  const connectedSince = await ensureConnectedSince();
  const cursor = (await getMeta(META_CURSOR)) ?? connectedSince;
  const since = laterIso(cursor, connectedSince);

  const { samples, nextCursor } = await connector.pullSince(since);
  const source = sourceFor(connector);

  let imported = 0;
  for (const sample of samples) {
    const result = await addEventLocal({
      id: sample.externalId, // id local = externalId estável (idempotência)
      type: sample.type,
      source,
      occurredAt: sample.occurredAt,
      payload: sample.payload,
    });
    if (result.inserted) imported += 1;
  }

  await setMeta(META_CURSOR, laterIso(nextCursor, since));
  await setMeta(META_CONNECTOR, connector.id);

  // Push em background — conectar Demo não deve travar a UI esperando a API.
  void pushPendingBatch().catch(() => undefined);
  return { imported, pushed: 0 };
}
