import { Injectable } from '@nestjs/common';
import { InsightRecord, InsightRepository } from '../domain/insight.repository';

@Injectable()
export class ListInsightsUseCase {
  constructor(private readonly insights: InsightRepository) {}

  async execute(userId: string, status?: string): Promise<InsightRecord[]> {
    return this.insights.listByUser(userId, status);
  }
}
