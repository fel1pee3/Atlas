import {
  EVENT_TYPES,
  INSIGHT_KINDS,
  INSIGHT_METHODS,
} from '@atlas/shared';
import type { EventRecord } from '../../events/domain/event.repository';
import type { InsightCandidate } from './insight.repository';

/**
 * Motor cross-domain M5 (docs/20 §2.5, docs/12 §7.1).
 * Médias condicionais / diferença de grupos com n mínimo.
 * Linguagem associativa — nunca causal.
 */

const MIN_GROUP = 5;
const LATE_HOUR_UTC = 20;
const BUSY_MEETINGS = 4;
const AWAY_MIN = 10 * 60; // 10h
const MIN_SLEEP_DELTA = 25; // minutos
const MIN_SPEND_RATIO = 1.25; // +25%
const MIN_MOOD_DELTA = 0.4;

export interface CrossDomainInput {
  sleepEvents: EventRecord[];
  workoutEvents: EventRecord[];
  calendarEvents: EventRecord[];
  expenseEvents: EventRecord[];
  locationEvents: EventRecord[];
  moodEvents: EventRecord[];
  asOfDay: string;
}

function dayOf(ev: EventRecord): string {
  return ev.occurredAt.toISOString().slice(0, 10);
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function formatHm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${String(m).padStart(2, '0')}`;
}

function prevDay(day: string): string {
  const d = new Date(`${day}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function sleepByDay(events: EventRecord[]): Map<string, { min: number; ids: string[] }> {
  const map = new Map<string, { min: number; ids: string[] }>();
  for (const ev of events) {
    if (ev.type !== EVENT_TYPES.SLEEP_RECORDED) continue;
    const n = Number(ev.payload.durationMin);
    if (!Number.isFinite(n) || n < 0) continue;
    const key = dayOf(ev);
    const cur = map.get(key) ?? { min: 0, ids: [] };
    cur.min += Math.round(n);
    cur.ids.push(ev.id);
    map.set(key, cur);
  }
  return map;
}

/** Treinos com início após LATE_HOUR_UTC (por occurredAt). */
function lateWorkoutDays(
  events: EventRecord[],
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const ev of events) {
    if (ev.type !== EVENT_TYPES.ACTIVITY_WORKOUT) continue;
    if (ev.occurredAt.getUTCHours() < LATE_HOUR_UTC) continue;
    const key = dayOf(ev);
    const cur = map.get(key) ?? [];
    cur.push(ev.id);
    map.set(key, cur);
  }
  return map;
}

function meetingsByDay(events: EventRecord[]): Map<string, { count: number; ids: string[] }> {
  const map = new Map<string, { count: number; ids: string[] }>();
  for (const ev of events) {
    if (ev.type !== EVENT_TYPES.CALENDAR_EVENT) continue;
    const key = dayOf(ev);
    const cur = map.get(key) ?? { count: 0, ids: [] };
    cur.count += 1;
    cur.ids.push(ev.id);
    map.set(key, cur);
  }
  return map;
}

function expenseByDay(events: EventRecord[]): Map<string, { amount: number; ids: string[] }> {
  const map = new Map<string, { amount: number; ids: string[] }>();
  for (const ev of events) {
    if (ev.type !== EVENT_TYPES.MANUAL_EXPENSE) continue;
    const amount = Number(ev.payload.amount);
    if (!Number.isFinite(amount) || amount < 0) continue;
    const key = dayOf(ev);
    const cur = map.get(key) ?? { amount: 0, ids: [] };
    cur.amount += amount;
    cur.ids.push(ev.id);
    map.set(key, cur);
  }
  return map;
}

function awayMinutesByDay(
  events: EventRecord[],
): Map<string, { min: number; ids: string[] }> {
  const map = new Map<string, { min: number; ids: string[] }>();
  for (const ev of events) {
    if (ev.type !== EVENT_TYPES.LOCATION_VISITED) continue;
    const label = typeof ev.payload.label === 'string' ? ev.payload.label : '';
    // "Casa" não conta como fora de casa.
    if (label.toLowerCase() === 'casa') continue;
    const a = typeof ev.payload.arrivedAt === 'string' ? Date.parse(ev.payload.arrivedAt) : NaN;
    const b = typeof ev.payload.leftAt === 'string' ? Date.parse(ev.payload.leftAt) : NaN;
    const mins =
      Number.isFinite(a) && Number.isFinite(b) && b >= a ? Math.round((b - a) / 60_000) : 0;
    const key = dayOf(ev);
    const cur = map.get(key) ?? { min: 0, ids: [] };
    cur.min += mins;
    cur.ids.push(ev.id);
    map.set(key, cur);
  }
  return map;
}

function moodByDay(events: EventRecord[]): Map<string, { scores: number[]; ids: string[] }> {
  const map = new Map<string, { scores: number[]; ids: string[] }>();
  for (const ev of events) {
    if (ev.type !== EVENT_TYPES.MANUAL_MOOD) continue;
    const score = Number(ev.payload.score);
    if (!Number.isFinite(score)) continue;
    const key = dayOf(ev);
    const cur = map.get(key) ?? { scores: [], ids: [] };
    cur.scores.push(score);
    cur.ids.push(ev.id);
    map.set(key, cur);
  }
  return map;
}

/**
 * Sono nas noites após treino tarde vs. demais (docs/20 §2.5 insight-alvo 1).
 * "Noite após" = sleep.recorded no dia D+1 após workout em D >= 20h UTC.
 */
export function detectSleepAfterLateWorkout(input: CrossDomainInput): InsightCandidate | null {
  const sleep = sleepByDay(input.sleepEvents);
  const late = lateWorkoutDays(input.workoutEvents);
  if (late.size === 0 || sleep.size === 0) return null;

  const after: number[] = [];
  const afterIds: string[] = [];
  const other: number[] = [];
  const otherIds: string[] = [];

  for (const [sleepDay, row] of sleep) {
    const workoutDay = prevDay(sleepDay);
    const workouts = late.get(workoutDay);
    if (workouts) {
      after.push(row.min);
      afterIds.push(...row.ids, ...workouts);
    } else {
      other.push(row.min);
      otherIds.push(...row.ids);
    }
  }

  if (after.length < MIN_GROUP || other.length < MIN_GROUP) return null;
  const avgAfter = mean(after);
  const avgOther = mean(other);
  const delta = avgOther - avgAfter;
  if (delta < MIN_SLEEP_DELTA) return null;

  const window = `${input.asOfDay}`;
  return {
    fingerprint: `${INSIGHT_KINDS.CROSS_SLEEP_AFTER_LATE_WORKOUT}:${window}`,
    kind: INSIGHT_KINDS.CROSS_SLEEP_AFTER_LATE_WORKOUT,
    title: 'Sono menor após treino tarde',
    body: `Nas noites após treino depois das ${LATE_HOUR_UTC}h, você dormiu ~${Math.round(delta)} min a menos (média ${formatHm(Math.round(avgAfter))} em ${after.length} noites vs. ${formatHm(Math.round(avgOther))} em ${other.length} noites sem treino tarde). Associação observacional — não é causa.`,
    confidence: Math.min(0.85, 0.5 + delta / 120 + Math.min(after.length, other.length) / 40),
    method: INSIGHT_METHODS.STATS,
    evidence: [...new Set(afterIds)].map((eventId) => ({ eventId, weight: 1.2 })).concat(
      [...new Set(otherIds)].slice(0, 20).map((eventId) => ({ eventId, weight: 0.6 })),
    ),
  };
}

/**
 * Gastos em dias com >4 reuniões vs. demais (docs/20 §2.5 insight-alvo 2).
 */
export function detectSpendOnBusyCalendar(input: CrossDomainInput): InsightCandidate | null {
  const meetings = meetingsByDay(input.calendarEvents);
  const expenses = expenseByDay(input.expenseEvents);
  if (meetings.size === 0 || expenses.size === 0) return null;

  const busy: number[] = [];
  const busyIds: string[] = [];
  const calm: number[] = [];
  const calmIds: string[] = [];

  for (const [day, exp] of expenses) {
    const m = meetings.get(day);
    if (m && m.count > BUSY_MEETINGS) {
      busy.push(exp.amount);
      busyIds.push(...exp.ids, ...m.ids);
    } else {
      calm.push(exp.amount);
      calmIds.push(...exp.ids);
      if (m) calmIds.push(...m.ids);
    }
  }

  if (busy.length < MIN_GROUP || calm.length < MIN_GROUP) return null;
  const avgBusy = mean(busy);
  const avgCalm = mean(calm);
  if (avgCalm <= 0 || avgBusy / avgCalm < MIN_SPEND_RATIO) return null;
  const pct = Math.round(((avgBusy - avgCalm) / avgCalm) * 100);

  return {
    fingerprint: `${INSIGHT_KINDS.CROSS_SPEND_ON_BUSY_CALENDAR}:${input.asOfDay}`,
    kind: INSIGHT_KINDS.CROSS_SPEND_ON_BUSY_CALENDAR,
    title: 'Gastos sobem em dias cheios de reuniões',
    body: `Em dias com mais de ${BUSY_MEETINGS} eventos na agenda, seus gastos ficaram ~${pct}% maiores (média R$ ${avgBusy.toFixed(2)} em ${busy.length} dias vs. R$ ${avgCalm.toFixed(2)} em ${calm.length} dias mais leves). Associação — não afirma causa.`,
    confidence: Math.min(0.8, 0.45 + pct / 200 + Math.min(busy.length, calm.length) / 30),
    method: INSIGHT_METHODS.STATS,
    evidence: [...new Set(busyIds)].map((eventId) => ({ eventId, weight: 1.2 })).concat(
      [...new Set(calmIds)].slice(0, 15).map((eventId) => ({ eventId, weight: 0.5 })),
    ),
  };
}

/**
 * Humor em dias fora de casa >10h vs. demais (docs/20 §2.5).
 */
export function detectMoodWhenAway(input: CrossDomainInput): InsightCandidate | null {
  const away = awayMinutesByDay(input.locationEvents);
  const moods = moodByDay(input.moodEvents);
  if (away.size === 0 || moods.size === 0) return null;

  const longAway: number[] = [];
  const longIds: string[] = [];
  const homeish: number[] = [];
  const homeIds: string[] = [];

  for (const [day, mood] of moods) {
    const avg = mean(mood.scores);
    const a = away.get(day);
    if (a && a.min >= AWAY_MIN) {
      longAway.push(avg);
      longIds.push(...mood.ids, ...a.ids);
    } else {
      homeish.push(avg);
      homeIds.push(...mood.ids);
      if (a) homeIds.push(...a.ids);
    }
  }

  if (longAway.length < MIN_GROUP || homeish.length < MIN_GROUP) return null;
  const avgAway = mean(longAway);
  const avgHome = mean(homeish);
  const delta = avgHome - avgAway;
  if (delta < MIN_MOOD_DELTA) return null;

  return {
    fingerprint: `${INSIGHT_KINDS.CROSS_MOOD_WHEN_AWAY}:${input.asOfDay}`,
    kind: INSIGHT_KINDS.CROSS_MOOD_WHEN_AWAY,
    title: 'Humor mais baixo fora de casa',
    body: `Em dias com mais de 10h fora de casa, seu humor médio foi ${avgAway.toFixed(1)}/5 (${longAway.length} dias) vs. ${avgHome.toFixed(1)}/5 nos demais (${homeish.length} dias). Padrão associativo — não é causa.`,
    confidence: Math.min(0.8, 0.5 + delta / 2),
    method: INSIGHT_METHODS.STATS,
    evidence: [...new Set(longIds)].map((eventId) => ({ eventId, weight: 1.2 })).concat(
      [...new Set(homeIds)].slice(0, 15).map((eventId) => ({ eventId, weight: 0.5 })),
    ),
  };
}

export function runCrossDomainPipeline(input: CrossDomainInput): InsightCandidate[] {
  return [
    detectSleepAfterLateWorkout(input),
    detectSpendOnBusyCalendar(input),
    detectMoodWhenAway(input),
  ].filter((c): c is InsightCandidate => c !== null);
}
