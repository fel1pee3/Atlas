/**
 * Taxonomia de Insights (docs/10 §insights, docs/12 §7, docs/11 §7).
 * M3: intra-domínio · M5: cross-domain (prova da tese) — sem LLM.
 */

export const INSIGHT_KINDS = {
  // --- M3 intra-domínio ---
  SLEEP_AVG_SUMMARY: 'sleep.avg_summary',
  SLEEP_LAST_VS_AVG: 'sleep.last_vs_avg',
  SLEEP_SHORT_STREAK: 'sleep.short_streak',
  SLEEP_BELOW_BASELINE: 'sleep.below_baseline',
  ACTIVITY_STEPS_AVG_SUMMARY: 'activity.steps_avg_summary',
  ACTIVITY_STEPS_TREND: 'activity.steps_trend',
  ACTIVITY_LOW_STEPS_STREAK: 'activity.low_steps_streak',

  // --- M5 cross-domain (docs/20 §2.5) ---
  CROSS_SLEEP_AFTER_LATE_WORKOUT: 'cross.sleep_after_late_workout',
  CROSS_SPEND_ON_BUSY_CALENDAR: 'cross.spend_on_busy_calendar',
  CROSS_MOOD_WHEN_AWAY: 'cross.mood_when_away',
} as const;

export type InsightKind = (typeof INSIGHT_KINDS)[keyof typeof INSIGHT_KINDS];

export function isCrossDomainKind(kind: string): boolean {
  return kind.startsWith('cross.');
}

export const INSIGHT_METHODS = {
  RULE: 'rule',
  STATS: 'stats',
} as const;

export type InsightMethod = (typeof INSIGHT_METHODS)[keyof typeof INSIGHT_METHODS];

export const INSIGHT_STATUSES = {
  ACTIVE: 'active',
  DISMISSED: 'dismissed',
  USEFUL: 'useful',
} as const;

export type InsightStatus = (typeof INSIGHT_STATUSES)[keyof typeof INSIGHT_STATUSES];
