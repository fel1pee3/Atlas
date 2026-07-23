import { Injectable } from '@nestjs/common';
import { DailyProjectionPort, DailySummary } from '../domain/daily-projection.port';
import { dayKeyUtc } from '../domain/day-key';

/**
 * Caso de uso: resumo diário a partir dos read models (docs/11 §5.1).
 * Alimenta a UI "Hoje" e será base dos insights heurísticos (M3).
 */
@Injectable()
export class GetDailySummaryUseCase {
  constructor(private readonly projections: DailyProjectionPort) {}

  async execute(userId: string, day?: string): Promise<DailySummary> {
    const key = day && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : dayKeyUtc(new Date());
    return this.projections.getDailySummary(userId, key);
  }
}
