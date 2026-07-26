import type { CalendarConnector, CalendarPullResult, CalendarSample } from './calendar.connector';

const LOOKBACK_DAYS = 30;

const TITLES = [
  'Stand-up',
  '1:1',
  'Revisão de projeto',
  'Almoço',
  'Médico',
  'Academia',
  'Café com amigo',
] as const;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function hashDay(day: string): number {
  let h = 0;
  for (let i = 0; i < day.length; i += 1) h = (h * 31 + day.charCodeAt(i)) >>> 0;
  return h;
}

function samplesForDay(day: string): CalendarSample[] {
  const h = hashDay(day);
  // Finais de semana: 0–1; dias úteis: alterna dia cheio (6) vs leve (2) — M5.
  const dow = new Date(`${day}T12:00:00.000Z`).getUTCDay();
  const isWeekend = dow === 0 || dow === 6;
  const count = isWeekend ? h % 2 : h % 2 === 0 ? 6 : 2;
  const out: CalendarSample[] = [];
  for (let i = 0; i < count; i += 1) {
    const title = TITLES[(h + i) % TITLES.length];
    const startHour = 9 + i;
    const startsAt = `${day}T${String(startHour).padStart(2, '0')}:00:00.000Z`;
    const ends = new Date(startsAt);
    ends.setUTCMinutes(ends.getUTCMinutes() + 30 + ((h + i) % 3) * 30);
    out.push({
      externalId: `demo:cal:${day}:${i}:${title}`,
      type: 'calendar.event',
      occurredAt: startsAt,
      payload: {
        title,
        startsAt,
        endsAt: ends.toISOString(),
        attendees: 1 + ((h + i) % 5),
      },
    });
  }
  return out;
}

export class DemoCalendarConnector implements CalendarConnector {
  readonly id = 'demo' as const;
  readonly label = 'Demo (só desenvolvimento)';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async requestPermissions(): Promise<{ granted: boolean }> {
    return { granted: true };
  }

  async pullSince(since: string, until?: string): Promise<CalendarPullResult> {
    const end = until ? new Date(until) : new Date();
    const start = new Date(since);
    const floor = new Date(end);
    floor.setUTCDate(floor.getUTCDate() - LOOKBACK_DAYS);
    if (start < floor) start.setTime(floor.getTime());

    const samples: CalendarSample[] = [];
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
