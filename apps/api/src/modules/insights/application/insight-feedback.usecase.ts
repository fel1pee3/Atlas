import { Injectable, NotFoundException } from '@nestjs/common';
import { INSIGHT_STATUSES } from '@atlas/shared';
import { InsightRecord, InsightRepository } from '../domain/insight.repository';

@Injectable()
export class InsightFeedbackUseCase {
  constructor(private readonly insights: InsightRepository) {}

  async execute(
    userId: string,
    id: string,
    action: 'useful' | 'dismiss' | 'reactivate',
  ): Promise<InsightRecord> {
    const status =
      action === 'useful'
        ? INSIGHT_STATUSES.USEFUL
        : action === 'dismiss'
          ? INSIGHT_STATUSES.DISMISSED
          : INSIGHT_STATUSES.ACTIVE;

    const updated = await this.insights.updateStatus(userId, id, status);
    if (!updated) throw new NotFoundException('Insight não encontrado');
    return updated;
  }
}
