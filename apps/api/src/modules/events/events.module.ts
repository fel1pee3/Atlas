import { Module } from '@nestjs/common';
import { EventsController } from './interface/events.controller';
import { IngestEventUseCase } from './application/ingest-event.usecase';
import { IngestEventBatchUseCase } from './application/ingest-event-batch.usecase';
import { GetTimelineUseCase } from './application/get-timeline.usecase';
import { PullSyncUseCase } from './application/pull-sync.usecase';
import { GetDailySummaryUseCase } from './application/get-daily-summary.usecase';
import { EventRepository } from './domain/event.repository';
import { DailyProjectionPort } from './domain/daily-projection.port';
import { PrismaEventRepository } from './infrastructure/prisma-event.repository';
import { PrismaDailyProjection } from './infrastructure/prisma-daily-projection';

/**
 * Bounded context de Eventos/Timeline (docs/09 §4, docs/11).
 * Portas EventRepository e DailyProjectionPort ligadas aos adapters Prisma.
 */
@Module({
  controllers: [EventsController],
  providers: [
    IngestEventUseCase,
    IngestEventBatchUseCase,
    GetTimelineUseCase,
    PullSyncUseCase,
    GetDailySummaryUseCase,
    { provide: EventRepository, useClass: PrismaEventRepository },
    { provide: DailyProjectionPort, useClass: PrismaDailyProjection },
  ],
})
export class EventsModule {}
