import {
  EVENT_TYPES,
  INSIGHT_KINDS,
  INSIGHT_METHODS,
} from '@atlas/shared';
import type { EventRecord } from '../../events/domain/event.repository';
import type { InsightCandidate } from './insight.repository';

/**
 * Motor heurístico M3 — degraus 1–2 da escada (docs/12 §2, §7).
 * Limiares pensados para dogfooding cedo (3–5 dias), sem LLM.
 */

/** Média / resumo precoce — antes exigia 7. */
const MIN_SLEEP_DAYS = 3;
const MIN_STEPS_DAYS = 3;
const SHORT_SLEEP_MIN = 360; // < 6h
const STREAK_MIN = 3;
const LOW_STEPS = 4000;
const BASELINE_DELTA_MIN = 25; // minutos
/** Baseline mais curta pra MVP testável. */
const MIN_BASELINE_TOTAL = 8;
const RECENT_WINDOW = 3;
const MIN_BASELINE_DAYS = 4;
const MIN_STEPS_TREND_DAYS = 6;
/** Última noite vs média anterior — Δ mínimo. */
const LAST_VS_AVG_DELTA_MIN = 40;

export interface HeuristicInput {
  sleepEvents: EventRecord[];
  stepsEvents: EventRecord[];
  /** Dia de referência (UTC YYYY-MM-DD), tipicamente "hoje". */
  asOfDay: string;
}

function dayOf(ev: EventRecord): string {
  return ev.occurredAt.toISOString().slice(0, 10);
}

function durationOf(ev: EventRecord): number | null {
  const n = Number(ev.payload.durationMin);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
}

function stepsOf(ev: EventRecord): number | null {
  const n = Number(ev.payload.steps);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
}

function formatHm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${String(m).padStart(2, '0')}`;
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Agrupa por dia (soma se houver múltiplos). */
function sleepByDay(events: EventRecord[]): Map<string, { min: number; ids: string[] }> {
  const map = new Map<string, { min: number; ids: string[] }>();
  for (const ev of events) {
    if (ev.type !== EVENT_TYPES.SLEEP_RECORDED) continue;
    const d = durationOf(ev);
    if (d === null) continue;
    const key = dayOf(ev);
    const cur = map.get(key) ?? { min: 0, ids: [] };
    cur.min += d;
    cur.ids.push(ev.id);
    map.set(key, cur);
  }
  return map;
}

function stepsByDay(events: EventRecord[]): Map<string, { steps: number; ids: string[] }> {
  const map = new Map<string, { steps: number; ids: string[] }>();
  for (const ev of events) {
    if (ev.type !== EVENT_TYPES.ACTIVITY_STEPS) continue;
    const s = stepsOf(ev);
    if (s === null) continue;
    const key = dayOf(ev);
    const cur = map.get(key) ?? { steps: 0, ids: [] };
    cur.steps += s;
    cur.ids.push(ev.id);
    map.set(key, cur);
  }
  return map;
}

function sortedDays(map: Map<string, unknown>): string[] {
  return [...map.keys()].sort();
}

/** 1. Resumo de média de sono (aha cedo — 3+ dias). */
export function detectSleepAvgSummary(input: HeuristicInput): InsightCandidate | null {
  const byDay = sleepByDay(input.sleepEvents);
  const days = sortedDays(byDay);
  if (days.length < MIN_SLEEP_DAYS) return null;

  const values = days.map((d) => byDay.get(d)!.min);
  const avg = Math.round(mean(values));
  const ids = days.flatMap((d) => byDay.get(d)!.ids);
  const window = `${days[0]}_${days[days.length - 1]}`;

  return {
    fingerprint: `${INSIGHT_KINDS.SLEEP_AVG_SUMMARY}:${window}`,
    kind: INSIGHT_KINDS.SLEEP_AVG_SUMMARY,
    title: 'Sua média de sono recente',
    body: `Nos últimos ${days.length} dias com registro, você dormiu em média ${formatHm(avg)} por noite.`,
    confidence: Math.min(0.9, 0.45 + days.length / 40),
    method: INSIGHT_METHODS.STATS,
    evidence: ids.map((eventId) => ({ eventId, weight: 1 })),
  };
}

/**
 * 1b. Última noite vs média das anteriores (3+ dias) — sinal cedo e acionável.
 */
export function detectLastSleepVsAvg(input: HeuristicInput): InsightCandidate | null {
  const byDay = sleepByDay(input.sleepEvents);
  const days = sortedDays(byDay);
  if (days.length < MIN_SLEEP_DAYS) return null;

  const lastDay = days[days.length - 1];
  const prior = days.slice(0, -1);
  if (prior.length < 2) return null;

  const last = byDay.get(lastDay)!.min;
  const avgPrior = mean(prior.map((d) => byDay.get(d)!.min));
  const delta = last - avgPrior;
  if (Math.abs(delta) < LAST_VS_AVG_DELTA_MIN) return null;

  const better = delta > 0;
  const ids = days.flatMap((d) => byDay.get(d)!.ids);

  return {
    fingerprint: `${INSIGHT_KINDS.SLEEP_LAST_VS_AVG}:${lastDay}`,
    kind: INSIGHT_KINDS.SLEEP_LAST_VS_AVG,
    title: better ? 'Última noite acima da média' : 'Última noite abaixo da média',
    body: `Na noite de ${lastDay} você dormiu ${formatHm(last)} — cerca de ${Math.round(Math.abs(delta))} min ${better ? 'a mais' : 'a menos'} que a média das ${prior.length} noites anteriores (${formatHm(Math.round(avgPrior))}). Observação — não afirma causa.`,
    confidence: Math.min(0.8, 0.5 + Math.abs(delta) / 150),
    method: INSIGHT_METHODS.STATS,
    evidence: ids.map((eventId) => ({ eventId, weight: 1 })),
  };
}

/** 2. Regra: <6h por STREAK_MIN noites seguidas. */
export function detectShortSleepStreak(input: HeuristicInput): InsightCandidate | null {
  const byDay = sleepByDay(input.sleepEvents);
  const days = sortedDays(byDay);
  if (days.length < STREAK_MIN) return null;

  let best: { start: number; end: number } | null = null;
  let runStart = 0;

  for (let i = 0; i < days.length; i += 1) {
    const short = byDay.get(days[i])!.min < SHORT_SLEEP_MIN;
    const prev = i > 0 ? days[i - 1] : null;
    const contiguous =
      prev !== null &&
      (() => {
        const a = new Date(`${prev}T00:00:00.000Z`);
        const b = new Date(`${days[i]}T00:00:00.000Z`);
        return (b.getTime() - a.getTime()) / 86_400_000 === 1;
      })();

    if (!short) {
      runStart = i + 1;
      continue;
    }
    if (i > 0 && !contiguous) runStart = i;

    const len = i - runStart + 1;
    if (len >= STREAK_MIN) {
      best = { start: runStart, end: i };
    }
  }

  if (!best) return null;

  const streakDays = days.slice(best.start, best.end + 1);
  const ids = streakDays.flatMap((d) => byDay.get(d)!.ids);
  const endDay = streakDays[streakDays.length - 1];

  return {
    fingerprint: `${INSIGHT_KINDS.SLEEP_SHORT_STREAK}:${endDay}`,
    kind: INSIGHT_KINDS.SLEEP_SHORT_STREAK,
    title: 'Sequência de noites curtas',
    body: `Você dormiu menos de 6h em ${streakDays.length} noites seguidas (até ${endDay}). Vale observar se isso se repete.`,
    confidence: 0.75,
    method: INSIGHT_METHODS.RULE,
    evidence: ids.map((eventId) => ({ eventId, weight: 1 })),
  };
}

/**
 * 3. Estatística: recente vs baseline (janela menor para MVP).
 */
export function detectSleepBelowBaseline(input: HeuristicInput): InsightCandidate | null {
  const byDay = sleepByDay(input.sleepEvents);
  const days = sortedDays(byDay);
  if (days.length < MIN_BASELINE_TOTAL) return null;

  const recentDays = days.slice(-RECENT_WINDOW);
  const baselineDays = days.slice(0, -RECENT_WINDOW).slice(-14);
  if (baselineDays.length < MIN_BASELINE_DAYS) return null;

  const recentAvg = mean(recentDays.map((d) => byDay.get(d)!.min));
  const baselineAvg = mean(baselineDays.map((d) => byDay.get(d)!.min));
  const delta = baselineAvg - recentAvg;
  if (delta < BASELINE_DELTA_MIN) return null;

  const ids = [...baselineDays, ...recentDays].flatMap((d) => byDay.get(d)!.ids);
  const asOf = recentDays[recentDays.length - 1];

  return {
    fingerprint: `${INSIGHT_KINDS.SLEEP_BELOW_BASELINE}:${asOf}`,
    kind: INSIGHT_KINDS.SLEEP_BELOW_BASELINE,
    title: 'Sono abaixo da sua baseline',
    body: `Nos últimos ${recentDays.length} dias você dormiu ~${Math.round(delta)} min a menos por noite do que nos ${baselineDays.length} dias anteriores (média recente ${formatHm(Math.round(recentAvg))} vs. ${formatHm(Math.round(baselineAvg))}). Associação observacional — não é causa.`,
    confidence: Math.min(0.85, 0.5 + delta / 120),
    method: INSIGHT_METHODS.STATS,
    evidence: ids.map((eventId, i) => ({
      eventId,
      weight: i >= baselineDays.length ? 1.2 : 0.8,
    })),
  };
}

/** 4a. Média de passos cedo (3+ dias). */
export function detectStepsAvgSummary(input: HeuristicInput): InsightCandidate | null {
  const byDay = stepsByDay(input.stepsEvents);
  const days = sortedDays(byDay);
  if (days.length < MIN_STEPS_DAYS) return null;

  const values = days.map((d) => byDay.get(d)!.steps);
  const avg = Math.round(mean(values));
  const ids = days.flatMap((d) => byDay.get(d)!.ids);
  const window = `${days[0]}_${days[days.length - 1]}`;

  return {
    fingerprint: `${INSIGHT_KINDS.ACTIVITY_STEPS_AVG_SUMMARY}:${window}`,
    kind: INSIGHT_KINDS.ACTIVITY_STEPS_AVG_SUMMARY,
    title: 'Sua média de passos recente',
    body: `Nos últimos ${days.length} dias com registro, você andou em média ${avg.toLocaleString('pt-BR')} passos por dia.`,
    confidence: Math.min(0.85, 0.45 + days.length / 40),
    method: INSIGHT_METHODS.STATS,
    evidence: ids.map((eventId) => ({ eventId, weight: 1 })),
  };
}

/** 4b. Tendência de passos: 1ª metade vs 2ª (6+ dias). */
export function detectStepsTrend(input: HeuristicInput): InsightCandidate | null {
  const byDay = stepsByDay(input.stepsEvents);
  const days = sortedDays(byDay);
  if (days.length < MIN_STEPS_TREND_DAYS) return null;

  const mid = Math.floor(days.length / 2);
  const first = days.slice(0, mid);
  const second = days.slice(mid);
  const avg1 = mean(first.map((d) => byDay.get(d)!.steps));
  const avg2 = mean(second.map((d) => byDay.get(d)!.steps));
  const deltaPct = ((avg2 - avg1) / Math.max(avg1, 1)) * 100;
  if (Math.abs(deltaPct) < 15) return null;

  const direction = deltaPct > 0 ? 'alta' : 'baixa';
  const ids = days.flatMap((d) => byDay.get(d)!.ids);
  const window = `${days[0]}_${days[days.length - 1]}`;

  return {
    fingerprint: `${INSIGHT_KINDS.ACTIVITY_STEPS_TREND}:${direction}:${window}`,
    kind: INSIGHT_KINDS.ACTIVITY_STEPS_TREND,
    title: `Passos em ${direction}`,
    body: `Comparando a primeira e a segunda metade dos seus ${days.length} dias com passos, a média mudou cerca de ${Math.abs(Math.round(deltaPct))}% (${Math.round(avg1).toLocaleString('pt-BR')} → ${Math.round(avg2).toLocaleString('pt-BR')} passos/dia).`,
    confidence: Math.min(0.8, 0.5 + Math.abs(deltaPct) / 100),
    method: INSIGHT_METHODS.STATS,
    evidence: ids.map((eventId) => ({ eventId, weight: 1 })),
  };
}

/** 5. Regra: passos baixos por STREAK_MIN dias seguidos. */
export function detectLowStepsStreak(input: HeuristicInput): InsightCandidate | null {
  const byDay = stepsByDay(input.stepsEvents);
  const days = sortedDays(byDay);
  if (days.length < STREAK_MIN) return null;

  let best: { start: number; end: number } | null = null;
  let runStart = 0;

  for (let i = 0; i < days.length; i += 1) {
    const low = byDay.get(days[i])!.steps < LOW_STEPS;
    const prev = i > 0 ? days[i - 1] : null;
    const contiguous =
      prev !== null &&
      (() => {
        const a = new Date(`${prev}T00:00:00.000Z`);
        const b = new Date(`${days[i]}T00:00:00.000Z`);
        return (b.getTime() - a.getTime()) / 86_400_000 === 1;
      })();

    if (!low) {
      runStart = i + 1;
      continue;
    }
    if (i > 0 && !contiguous) runStart = i;

    const len = i - runStart + 1;
    if (len >= STREAK_MIN) best = { start: runStart, end: i };
  }

  if (!best) return null;
  const streakDays = days.slice(best.start, best.end + 1);
  const ids = streakDays.flatMap((d) => byDay.get(d)!.ids);
  const endDay = streakDays[streakDays.length - 1];

  return {
    fingerprint: `${INSIGHT_KINDS.ACTIVITY_LOW_STEPS_STREAK}:${endDay}`,
    kind: INSIGHT_KINDS.ACTIVITY_LOW_STEPS_STREAK,
    title: 'Poucos passos por alguns dias',
    body: `Você ficou abaixo de ${LOW_STEPS.toLocaleString('pt-BR')} passos em ${streakDays.length} dias seguidos (até ${endDay}).`,
    confidence: 0.7,
    method: INSIGHT_METHODS.RULE,
    evidence: ids.map((eventId) => ({ eventId, weight: 1 })),
  };
}

/** Roda todos os detectores M3 e devolve candidatos não-nulos. */
export function runHeuristicPipeline(input: HeuristicInput): InsightCandidate[] {
  return [
    detectSleepAvgSummary(input),
    detectLastSleepVsAvg(input),
    detectShortSleepStreak(input),
    detectSleepBelowBaseline(input),
    detectStepsAvgSummary(input),
    detectStepsTrend(input),
    detectLowStepsStreak(input),
  ].filter((c): c is InsightCandidate => c !== null);
}
