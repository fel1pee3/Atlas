import type { LocationConnector, LocationPullResult, LocationSample } from './location.connector';

/**
 * Demo de visitas (Expo Go) — docs/08 §10.1 / M4–M5.
 * Alguns dias têm >10h fora de casa (para cross mood × location).
 */

const PLACES = [
  { label: 'Casa', lat: -23.5505, lng: -46.6333 },
  { label: 'Trabalho', lat: -23.5614, lng: -46.6559 },
  { label: 'Academia', lat: -23.557, lng: -46.66 },
] as const;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function hashDay(day: string): number {
  let h = 0;
  for (let i = 0; i < day.length; i += 1) h = (h * 31 + day.charCodeAt(i)) >>> 0;
  return h;
}

function samplesForDay(day: string): LocationSample[] {
  const h = hashDay(day);
  const longAway = h % 3 === 0;

  if (longAway) {
    // Trabalho 8h + Academia 3h = 11h fora
    return [
      {
        externalId: `demo:visit:${day}:Trabalho`,
        type: 'location.visited',
        occurredAt: `${day}T09:00:00.000Z`,
        payload: {
          lat: PLACES[1].lat,
          lng: PLACES[1].lng,
          label: 'Trabalho',
          arrivedAt: `${day}T09:00:00.000Z`,
          leftAt: `${day}T17:00:00.000Z`,
        },
      },
      {
        externalId: `demo:visit:${day}:Academia`,
        type: 'location.visited',
        occurredAt: `${day}T18:00:00.000Z`,
        payload: {
          lat: PLACES[2].lat,
          lng: PLACES[2].lng,
          label: 'Academia',
          arrivedAt: `${day}T18:00:00.000Z`,
          leftAt: `${day}T21:00:00.000Z`,
        },
      },
    ];
  }

  const place = PLACES[h % PLACES.length];
  const arrivedAt = `${day}T10:00:00.000Z`;
  const left = new Date(arrivedAt);
  left.setUTCHours(left.getUTCHours() + 2 + (h % 3));
  return [
    {
      externalId: `demo:visit:${day}:${place.label}`,
      type: 'location.visited',
      occurredAt: arrivedAt,
      payload: {
        lat: place.lat,
        lng: place.lng,
        label: place.label,
        arrivedAt,
        leftAt: left.toISOString(),
      },
    },
  ];
}

export class DemoLocationConnector implements LocationConnector {
  readonly id = 'demo' as const;
  readonly label = 'Demo (só desenvolvimento)';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async requestPermissions(): Promise<{ granted: boolean }> {
    return { granted: true };
  }

  async pullSince(since: string, until?: string): Promise<LocationPullResult> {
    const end = until ? new Date(until) : new Date();
    const start = new Date(since);

    const samples: LocationSample[] = [];
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
