import { Module } from '@nestjs/common';
import { SearchModule } from '../search/search.module';
import { EventRepository } from '../events/domain/event.repository';
import { PrismaEventRepository } from '../events/infrastructure/prisma-event.repository';
import { InsightsController } from './interface/insights.controller';
import { GenerateInsightsUseCase } from './application/generate-insights.usecase';
import { ListInsightsUseCase } from './application/list-insights.usecase';
import { GetInsightUseCase } from './application/get-insight.usecase';
import { InsightFeedbackUseCase } from './application/insight-feedback.usecase';
import { InsightRepository } from './domain/insight.repository';
import { PrismaInsightRepository } from './infrastructure/prisma-insight.repository';

/**
 * Bounded context de Insights (docs/09 §4, docs/12 §7).
 * Reusa a porta EventRepository (adapter Prisma) no monólito modular.
 */
@Module({
  imports: [SearchModule],
  controllers: [InsightsController],
  providers: [
    GenerateInsightsUseCase,
    ListInsightsUseCase,
    GetInsightUseCase,
    InsightFeedbackUseCase,
    { provide: InsightRepository, useClass: PrismaInsightRepository },
    { provide: EventRepository, useClass: PrismaEventRepository },
  ],
})
export class InsightsModule {}
