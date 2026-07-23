import { Injectable, NotFoundException } from '@nestjs/common';
import { InsightDetail, InsightRepository } from '../domain/insight.repository';

@Injectable()
export class GetInsightUseCase {
  constructor(private readonly insights: InsightRepository) {}

  async execute(userId: string, id: string): Promise<InsightDetail> {
    const detail = await this.insights.findById(userId, id);
    if (!detail) throw new NotFoundException('Insight não encontrado');
    return detail;
  }
}
