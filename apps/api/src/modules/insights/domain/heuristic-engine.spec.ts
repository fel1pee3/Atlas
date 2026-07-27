import { EVENT_TYPES } from '@atlas/shared';
import type { EventRecord } from '../../events/domain/event.repository';
import {
  detectShortSleepStreak,
  detectSleepAvgSummary,
  detectLastSleepVsAvg,
  detectSleepBelowBaseline,
  detectLowStepsStreak,
  detectStepsTrend,
  detectStepsAvgSummary,
} from './heuristic-engine';

function sleepEv(id: string, day: string, durationMin: number): EventRecord {
  return {
    id,
    userId: 'u1',
    type: EVENT_TYPES.SLEEP_RECORDED,
    source: 'demo',
    externalId: id,
    occurredAt: new Date(`${day}T07:00:00.000Z`),
    ingestedAt: new Date(`${day}T08:00:00.000Z`),
    payload: { durationMin },
  };
}

function stepsEv(id: string, day: string, steps: number): EventRecord {
  return {
    id,
    userId: 'u1',
    type: EVENT_TYPES.ACTIVITY_STEPS,
    source: 'demo',
    externalId: id,
    occurredAt: new Date(`${day}T23:00:00.000Z`),
    ingestedAt: new Date(`${day}T23:30:00.000Z`),
    payload: { steps },
  };
}

describe('heuristic-engine (M3)', () => {
  it('emite média de sono com n >= 3', () => {
    const sleepEvents = Array.from({ length: 4 }, (_, i) => {
      const day = `2026-07-${String(i + 1).padStart(2, '0')}`;
      return sleepEv(`s${i}`, day, 420);
    });
    const c = detectSleepAvgSummary({
      sleepEvents,
      stepsEvents: [],
      asOfDay: '2026-07-22',
    });
    expect(c).not.toBeNull();
    expect(c!.body).toMatch(/7h00/);
    expect(c!.evidence.length).toBe(4);
  });

  it('não emite média com poucos dias', () => {
    const c = detectSleepAvgSummary({
      sleepEvents: [sleepEv('s1', '2026-07-01', 400)],
      stepsEvents: [],
      asOfDay: '2026-07-22',
    });
    expect(c).toBeNull();
  });

  it('detecta última noite vs média', () => {
    const sleepEvents = [
      sleepEv('a', '2026-07-10', 420),
      sleepEv('b', '2026-07-11', 430),
      sleepEv('c', '2026-07-12', 300),
    ];
    const c = detectLastSleepVsAvg({
      sleepEvents,
      stepsEvents: [],
      asOfDay: '2026-07-22',
    });
    expect(c).not.toBeNull();
    expect(c!.title).toMatch(/abaixo/);
  });

  it('detecta sequência de noites < 6h', () => {
    const sleepEvents = [
      sleepEv('a', '2026-07-10', 500),
      sleepEv('b', '2026-07-11', 300),
      sleepEv('c', '2026-07-12', 310),
      sleepEv('d', '2026-07-13', 320),
    ];
    const c = detectShortSleepStreak({
      sleepEvents,
      stepsEvents: [],
      asOfDay: '2026-07-22',
    });
    expect(c).not.toBeNull();
    expect(c!.evidence.map((e) => e.eventId)).toEqual(['b', 'c', 'd']);
  });

  it('detecta sono abaixo da baseline', () => {
    const sleepEvents: EventRecord[] = [];
    // 5 dias baseline ~7h30, 3 dias recentes ~6h
    for (let i = 0; i < 8; i += 1) {
      const day = `2026-07-${String(i + 1).padStart(2, '0')}`;
      sleepEvents.push(sleepEv(`s${i}`, day, i < 5 ? 450 : 360));
    }
    const c = detectSleepBelowBaseline({
      sleepEvents,
      stepsEvents: [],
      asOfDay: '2026-07-22',
    });
    expect(c).not.toBeNull();
    expect(c!.method).toBe('stats');
  });

  it('emite média de passos com n >= 3', () => {
    const stepsEvents = [
      stepsEv('p1', '2026-07-01', 5000),
      stepsEv('p2', '2026-07-02', 6000),
      stepsEv('p3', '2026-07-03', 7000),
    ];
    const c = detectStepsAvgSummary({
      sleepEvents: [],
      stepsEvents,
      asOfDay: '2026-07-22',
    });
    expect(c).not.toBeNull();
    expect(c!.body).toMatch(/passos/);
    expect(c!.body).toMatch(/3 dias/);
  });

  it('detecta tendência de passos', () => {
    const stepsEvents: EventRecord[] = [];
    for (let i = 0; i < 8; i += 1) {
      const day = `2026-07-${String(i + 1).padStart(2, '0')}`;
      stepsEvents.push(stepsEv(`p${i}`, day, i < 4 ? 9000 : 5000));
    }
    const c = detectStepsTrend({
      sleepEvents: [],
      stepsEvents,
      asOfDay: '2026-07-22',
    });
    expect(c).not.toBeNull();
    expect(c!.title).toMatch(/baixa/);
  });

  it('detecta sequência de poucos passos', () => {
    const stepsEvents = [
      stepsEv('a', '2026-07-10', 8000),
      stepsEv('b', '2026-07-11', 2000),
      stepsEv('c', '2026-07-12', 1500),
      stepsEv('d', '2026-07-13', 3000),
    ];
    const c = detectLowStepsStreak({
      sleepEvents: [],
      stepsEvents,
      asOfDay: '2026-07-22',
    });
    expect(c).not.toBeNull();
    expect(c!.evidence).toHaveLength(3);
  });
});
