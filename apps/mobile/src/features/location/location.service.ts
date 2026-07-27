import { eq } from 'drizzle-orm';
import { EVENT_SOURCES } from '@atlas/shared';
import { getDb } from '../../db/client';
import { syncMeta } from '../../db/schema';
import { addEventLocal, pushPendingBatch } from '../events/events.service';
import { startOfUtcDayIso } from '../sync/connection-day';
import type { LocationConnector } from './location.connector';
import { resolveLocationConnector } from './resolve-connector';

const META_ENABLED = 'location.enabled';
const META_CONNECTOR = 'location.connector.id';
const META_CURSOR = 'location.pull.cursor';
const META_CONNECTED_SINCE = 'location.connected.since';

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

export async function isLocationEnabled(): Promise<boolean> {
  return (await getMeta(META_ENABLED)) === '1';
}

export async function getActiveLocationConnectorId(): Promise<string | null> {
  return (await getMeta(META_CONNECTOR)) ?? null;
}

export async function enableLocation(
  connector: LocationConnector,
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

export async function disableLocation(): Promise<void> {
  await setMeta(META_ENABLED, '0');
}

function sourceFor(connector: LocationConnector): string {
  return connector.id === 'device_location' ? EVENT_SOURCES.DEVICE_LOCATION : EVENT_SOURCES.DEMO;
}

export type LocationSyncResult = {
  imported: number;
  pushed: number;
  /** O que o GPS/reverse-geocode leu agora (para conferir). */
  reading?: {
    label?: string;
    lat: number;
    lng: number;
    accuracyM?: number;
  };
};

export async function syncLocationNow(
  connector: LocationConnector = resolveLocationConnector(),
): Promise<LocationSyncResult> {
  if (!(await isLocationEnabled())) return { imported: 0, pushed: 0 };

  // Device: visita pontual atual. Demo: só a partir do dia da conexão.
  const since = await ensureConnectedSince();
  const { samples } = await connector.pullSince(since);
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

  // M5 dogfooding: Demo semeia humor correlacionado ao tempo fora de casa.
  if (connector.id === 'demo') {
    imported += await seedDemoMoodFromVisits(samples);
  }

  await setMeta(META_CURSOR, new Date().toISOString());
  await setMeta(META_CONNECTOR, connector.id);
  void pushPendingBatch().catch(() => undefined);

  const first = samples[0];
  const reading = first
    ? {
        label: first.payload.label,
        lat: first.payload.lat,
        lng: first.payload.lng,
        accuracyM:
          typeof first.payload.accuracyM === 'number' ? first.payload.accuracyM : undefined,
      }
    : undefined;

  return { imported, pushed: 0, reading };
}

async function seedDemoMoodFromVisits(
  samples: Array<{
    occurredAt: string;
    payload: { label?: string; arrivedAt?: string; leftAt?: string };
  }>,
): Promise<number> {
  const awayByDay = new Map<string, number>();
  for (const s of samples) {
    const day = s.occurredAt.slice(0, 10);
    const label = (s.payload.label ?? '').toLowerCase();
    if (label === 'casa') continue;
    const a = s.payload.arrivedAt ? Date.parse(s.payload.arrivedAt) : NaN;
    const b = s.payload.leftAt ? Date.parse(s.payload.leftAt) : NaN;
    const mins =
      Number.isFinite(a) && Number.isFinite(b) && b >= a ? Math.round((b - a) / 60_000) : 0;
    awayByDay.set(day, (awayByDay.get(day) ?? 0) + mins);
  }
  let inserted = 0;
  for (const [day, awayMin] of awayByDay) {
    const longAway = awayMin >= 10 * 60;
    const score = longAway ? 2 : 4;
    const result = await addEventLocal({
      id: `demo:mood:${day}`,
      type: 'manual.mood',
      source: EVENT_SOURCES.DEMO,
      occurredAt: `${day}T21:00:00.000Z`,
      payload: {
        score,
        note: longAway ? 'Dia longo fora (demo)' : 'Dia mais em casa (demo)',
      },
    });
    if (result.inserted) inserted += 1;
  }
  return inserted;
}
