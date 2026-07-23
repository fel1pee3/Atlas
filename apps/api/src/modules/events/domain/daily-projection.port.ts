/**
 * Porta de projeções diárias (read models) — docs/10 §8, docs/11 §5.1.
 * Derivadas, descartáveis e recomputáveis a partir de `events`.
 */

export interface DailyMoodSummary {
  day: string;
  count: number;
  avgScore: number | null;
}

export interface DailyExpenseSummary {
  day: string;
  count: number;
  totalAmount: number;
  currency: string;
}

export interface DailySleepSummary {
  day: string;
  count: number;
  totalDurationMin: number;
}

export interface DailyActivitySummary {
  day: string;
  totalSteps: number;
  workoutCount: number;
}

export interface DailyPlacesSummary {
  day: string;
  visitCount: number;
  totalDurationMin: number;
}

export interface DailyCalendarSummary {
  day: string;
  eventCount: number;
  totalDurationMin: number;
}

export interface DailySummary {
  day: string;
  mood: DailyMoodSummary | null;
  expense: DailyExpenseSummary | null;
  sleep: DailySleepSummary | null;
  activity: DailyActivitySummary | null;
  places: DailyPlacesSummary | null;
  calendar: DailyCalendarSummary | null;
}

export abstract class DailyProjectionPort {
  abstract applyEvent(input: {
    userId: string;
    type: string;
    occurredAt: Date;
    payload: Record<string, unknown>;
  }): Promise<void>;

  abstract rebuildDay(userId: string, day: string): Promise<void>;

  abstract getDailySummary(userId: string, day: string): Promise<DailySummary>;
}
