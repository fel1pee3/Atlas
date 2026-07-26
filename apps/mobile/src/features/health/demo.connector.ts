import type { HealthConnector, HealthPermission, HealthPullResult, HealthSample } from './health.connector';

/**
 * Demo saúde (Expo Go) — docs/08 §10.3 + M5.
 * Inclui treinos tarde correlacionados com sono mais curto na noite seguinte
 * (para o insight cross-domain ser observável no dogfooding).
 */
const LOOKBACK_DAYS = 30;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function hashDay(day: string): number {
  let h = 0;
  for (let i = 0; i < day.length; i += 1) h = (h * 31 + day.charCodeAt(i)) >>> 0;
  return h;
}

function prevDay(day: string): string {
  const d = new Date(`${day}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function hadLateWorkout(day: string): boolean {
  return hashDay(day) % 4 === 0;
}

function samplesForDay(day: string): HealthSample[] {
  const h = hashDay(day);
  const afterLate = hadLateWorkout(prevDay(day));
  // Noite após treino tarde: ~5h–5h40; caso contrário ~6h40–8h10.
  const durationMin = afterLate ? 300 + (h % 41) : 400 + (h % 91);

  const out: HealthSample[] = [
    {
      externalId: `demo:sleep:${day}`,
      type: 'sleep.recorded',
      occurredAt: `${day}T07:00:00.000Z`,
      payload: {
        durationMin,
        efficiency: 0.75 + ((h % 20) / 100),
      },
    },
    {
      externalId: `demo:steps:${day}`,
      type: 'activity.steps',
      occurredAt: `${day}T23:00:00.000Z`,
      payload: { steps: 2000 + (h % 10001) },
    },
  ];

  if (hadLateWorkout(day)) {
    out.push({
      externalId: `demo:workout:${day}`,
      type: 'activity.workout',
      occurredAt: `${day}T21:00:00.000Z`,
      payload: { kind: 'musculação', durationMin: 45 + (h % 30) },
    });
  }

  return out;
}

export class DemoHealthConnector implements HealthConnector {
  readonly id = 'demo' as const;
  readonly label = 'Demo (só desenvolvimento)';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async requestPermissions(_kinds: HealthPermission[]): Promise<{ granted: boolean }> {
    return { granted: true };
  }

  async pullSince(since: string, until?: string): Promise<HealthPullResult> {
    const end = until ? new Date(until) : new Date();
    const start = new Date(since);
    const floor = new Date(end);
    floor.setUTCDate(floor.getUTCDate() - LOOKBACK_DAYS);
    if (start < floor) start.setTime(floor.getTime());

    const samples: HealthSample[] = [];
    const cursor = new Date(start);
    const endDay = dayKey(end);
    const sinceDay = since.slice(0, 10);
    while (dayKey(cursor) <= endDay) {
      const key = dayKey(cursor);
      if (key >= sinceDay) samples.push(...samplesForDay(key));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return { samples, nextCursor: end.toISOString() };
  }
}
