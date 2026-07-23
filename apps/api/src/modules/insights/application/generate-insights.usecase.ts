import { Injectable } from '@nestjs/common';
import { EVENT_TYPES } from '@atlas/shared';
import { EventRepository } from '../../events/domain/event.repository';
import { InsightRecord, InsightRepository } from '../domain/insight.repository';
import { runHeuristicPipeline } from '../domain/heuristic-engine';
import { runCrossDomainPipeline } from '../domain/cross-domain-engine';
import { dayKeyUtc } from '../../events/domain/day-key';

const LOOKBACK_DAYS = 45;

/**
 * Gera insights M3 (intra) + M5 (cross-domain) (docs/12 §7, docs/20 §2.5).
 * Idempotente por fingerprint; respeita status dismissed/useful.
 */
@Injectable()
export class GenerateInsightsUseCase {
  constructor(
    private readonly events: EventRepository,
    private readonly insights: InsightRepository,
  ) {}

  async execute(userId: string): Promise<{ generated: number; items: InsightRecord[] }> {
    const to = new Date();
    const from = new Date(to);
    from.setUTCDate(from.getUTCDate() - LOOKBACK_DAYS);
    const asOfDay = dayKeyUtc(to);

    const [
      sleepEvents,
      stepsEvents,
      workoutEvents,
      calendarEvents,
      expenseEvents,
      locationEvents,
      moodEvents,
    ] = await Promise.all([
      this.events.listByUserTypes(userId, [EVENT_TYPES.SLEEP_RECORDED], from, to),
      this.events.listByUserTypes(userId, [EVENT_TYPES.ACTIVITY_STEPS], from, to),
      this.events.listByUserTypes(userId, [EVENT_TYPES.ACTIVITY_WORKOUT], from, to),
      this.events.listByUserTypes(userId, [EVENT_TYPES.CALENDAR_EVENT], from, to),
      this.events.listByUserTypes(userId, [EVENT_TYPES.MANUAL_EXPENSE], from, to),
      this.events.listByUserTypes(userId, [EVENT_TYPES.LOCATION_VISITED], from, to),
      this.events.listByUserTypes(userId, [EVENT_TYPES.MANUAL_MOOD], from, to),
    ]);

    const candidates = [
      ...runHeuristicPipeline({ sleepEvents, stepsEvents, asOfDay }),
      ...runCrossDomainPipeline({
        sleepEvents,
        workoutEvents,
        calendarEvents,
        expenseEvents,
        locationEvents,
        moodEvents,
        asOfDay,
      }),
    ];

    // Cross-domain primeiro no feed (prova da tese).
    candidates.sort((a, b) => {
      const ac = a.kind.startsWith('cross.') ? 0 : 1;
      const bc = b.kind.startsWith('cross.') ? 0 : 1;
      return ac - bc;
    });

    const items: InsightRecord[] = [];
    for (const c of candidates) {
      items.push(await this.insights.upsertCandidate(userId, c));
    }
    return { generated: items.length, items };
  }
}
