import { EVENT_TYPES } from '@atlas/shared';
import type { EventRecord } from '../../events/domain/event.repository';
import {
  detectMoodWhenAway,
  detectSleepAfterLateWorkout,
  detectSpendOnBusyCalendar,
} from './cross-domain-engine';

function ev(
  id: string,
  type: string,
  day: string,
  hour: number,
  payload: Record<string, unknown>,
): EventRecord {
  return {
    id,
    userId: 'u1',
    type,
    source: 'demo',
    externalId: id,
    occurredAt: new Date(`${day}T${String(hour).padStart(2, '0')}:00:00.000Z`),
    ingestedAt: new Date(`${day}T${String(hour).padStart(2, '0')}:30:00.000Z`),
    payload,
  };
}

describe('cross-domain-engine (M5)', () => {
  it('detecta sono menor após treino tarde', () => {
    const sleepEvents: EventRecord[] = [];
    const workoutEvents: EventRecord[] = [];
    // 10 dias: treino tarde em dias pares; sono no dia seguinte
    for (let i = 1; i <= 20; i += 1) {
      const day = `2026-07-${String(i).padStart(2, '0')}`;
      if (i % 2 === 0) {
        workoutEvents.push(
          ev(`w${i}`, EVENT_TYPES.ACTIVITY_WORKOUT, day, 21, {
            kind: 'run',
            durationMin: 40,
          }),
        );
      }
    }
    for (let i = 2; i <= 21; i += 1) {
      const day = `2026-07-${String(i).padStart(2, '0')}`;
      const afterWorkout = (i - 1) % 2 === 0;
      sleepEvents.push(
        ev(`s${i}`, EVENT_TYPES.SLEEP_RECORDED, day, 7, {
          durationMin: afterWorkout ? 320 : 450,
        }),
      );
    }

    const c = detectSleepAfterLateWorkout({
      sleepEvents,
      workoutEvents,
      calendarEvents: [],
      expenseEvents: [],
      locationEvents: [],
      moodEvents: [],
      asOfDay: '2026-07-22',
    });
    expect(c).not.toBeNull();
    expect(c!.kind).toBe('cross.sleep_after_late_workout');
    expect(c!.body).toMatch(/menos/);
  });

  it('detecta gastos maiores em dias com muitas reuniões', () => {
    const calendarEvents: EventRecord[] = [];
    const expenseEvents: EventRecord[] = [];
    for (let i = 1; i <= 14; i += 1) {
      const day = `2026-07-${String(i).padStart(2, '0')}`;
      const busy = i <= 7;
      const meetings = busy ? 5 : 2;
      for (let m = 0; m < meetings; m += 1) {
        calendarEvents.push(
          ev(`c${i}-${m}`, EVENT_TYPES.CALENDAR_EVENT, day, 9 + m, {
            title: 'Reunião',
            startsAt: `${day}T${String(9 + m).padStart(2, '0')}:00:00.000Z`,
            endsAt: `${day}T${String(9 + m).padStart(2, '0')}:30:00.000Z`,
          }),
        );
      }
      expenseEvents.push(
        ev(`e${i}`, EVENT_TYPES.MANUAL_EXPENSE, day, 19, {
          amount: busy ? 150 : 40,
          currency: 'BRL',
        }),
      );
    }

    const c = detectSpendOnBusyCalendar({
      sleepEvents: [],
      workoutEvents: [],
      calendarEvents,
      expenseEvents,
      locationEvents: [],
      moodEvents: [],
      asOfDay: '2026-07-22',
    });
    expect(c).not.toBeNull();
    expect(c!.kind).toBe('cross.spend_on_busy_calendar');
  });

  it('detecta humor mais baixo fora de casa', () => {
    const locationEvents: EventRecord[] = [];
    const moodEvents: EventRecord[] = [];
    for (let i = 1; i <= 14; i += 1) {
      const day = `2026-07-${String(i).padStart(2, '0')}`;
      const longAway = i <= 7;
      locationEvents.push(
        ev(`l${i}`, EVENT_TYPES.LOCATION_VISITED, day, 9, {
          lat: -23.5,
          lng: -46.6,
          label: 'Trabalho',
          arrivedAt: `${day}T09:00:00.000Z`,
          leftAt: longAway ? `${day}T20:00:00.000Z` : `${day}T12:00:00.000Z`,
        }),
      );
      moodEvents.push(
        ev(`m${i}`, EVENT_TYPES.MANUAL_MOOD, day, 21, {
          score: longAway ? 2 : 4,
        }),
      );
    }

    const c = detectMoodWhenAway({
      sleepEvents: [],
      workoutEvents: [],
      calendarEvents: [],
      expenseEvents: [],
      locationEvents,
      moodEvents,
      asOfDay: '2026-07-22',
    });
    expect(c).not.toBeNull();
    expect(c!.kind).toBe('cross.mood_when_away');
  });
});
