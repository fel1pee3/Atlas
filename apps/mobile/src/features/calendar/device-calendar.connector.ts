import { Platform } from 'react-native';
import {
  EntityTypes,
  getCalendarPermissions,
  getCalendars,
  listEvents,
  requestCalendarPermissions,
  type ExpoCalendarEvent,
} from 'expo-calendar';
import type { CalendarConnector, CalendarPullResult, CalendarSample } from './calendar.connector';

/**
 * Agenda do aparelho via Calendar Provider (expo-calendar).
 * Cobre Samsung/Google/etc. sincronizados no sistema — sem OAuth.
 */
export class DeviceCalendarConnector implements CalendarConnector {
  readonly id = 'device_calendar' as const;
  readonly label = 'Calendário do aparelho';

  async isAvailable(): Promise<boolean> {
    return Platform.OS === 'android' || Platform.OS === 'ios';
  }

  async requestPermissions(): Promise<{ granted: boolean }> {
    if (!(await this.isAvailable())) return { granted: false };
    const result = await requestCalendarPermissions();
    return { granted: result.granted };
  }

  async pullSince(since: string, until?: string): Promise<CalendarPullResult> {
    if (!(await this.isAvailable())) {
      throw new Error('Calendário do aparelho requer build nativo (não Expo Go puro).');
    }

    const permission = await getCalendarPermissions();
    if (!permission.granted) {
      throw new Error('Permissão de calendário não concedida.');
    }

    const startDate = new Date(since);
    const endDate = until
      ? new Date(until)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const calendars = await getCalendars(EntityTypes.EVENT);
    const samples: CalendarSample[] = [];

    if (calendars.length === 0) {
      return { samples: [], nextCursor: endDate.toISOString() };
    }

    let events: ExpoCalendarEvent[] = [];
    try {
      events = await listEvents(calendars, startDate, endDate);
    } catch {
      // Fallback: per-calendar (alguns OEMs falham no batch).
      for (const cal of calendars) {
        try {
          const chunk = await listEvents([cal], startDate, endDate);
          events.push(...chunk);
        } catch {
          // skip calendar
        }
      }
    }

    for (const ev of events) {
      const startsAt = toIso(ev.startDate as string | Date | undefined);
      if (!startsAt) continue;
      const id = String(ev.id ?? `${startsAt}:${ev.title ?? ''}`);
      const endsAt = toIso(ev.endDate as string | Date | undefined);
      samples.push({
        externalId: `device:cal:${id}`,
        type: 'calendar.event',
        occurredAt: startsAt,
        payload: {
          title: String(ev.title ?? '').trim() || '(sem título)',
          startsAt,
          endsAt: endsAt ?? undefined,
          location: ev.location ? String(ev.location) : undefined,
        },
      });
    }

    samples.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    // Cursor = momento do pull (não o fim da janela futura — senão o próximo sync fica vazio).
    return { samples, nextCursor: new Date().toISOString() };
  }
}

function toIso(value: string | Date | undefined): string | null {
  if (value == null) return null;
  if (typeof value === 'string') {
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
  }
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }
  return null;
}
