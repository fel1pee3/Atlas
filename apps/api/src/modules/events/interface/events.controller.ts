import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IngestEventBatchSchema, IngestEventSchema } from '@atlas/shared';
import { z } from 'zod';
import { AccessTokenGuard } from '../../identity/interface/access-token.guard';
import { CurrentUser } from '../../identity/interface/current-user.decorator';
import { ZodValidationPipe } from '../../../shared/http/zod-validation.pipe';
import { IngestEventUseCase } from '../application/ingest-event.usecase';
import { IngestEventBatchUseCase } from '../application/ingest-event-batch.usecase';
import { GetTimelineUseCase } from '../application/get-timeline.usecase';
import { PullSyncUseCase } from '../application/pull-sync.usecase';
import { GetDailySummaryUseCase } from '../application/get-daily-summary.usecase';

const TimelineQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).optional(),
  cursor: z.string().optional(),
  type: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
type TimelineQueryDto = z.infer<typeof TimelineQuerySchema>;

const SyncQuerySchema = z.object({
  since: z.string().datetime().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
});
type SyncQueryDto = z.infer<typeof SyncQuerySchema>;

const DailyQuerySchema = z.object({
  day: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});
type DailyQueryDto = z.infer<typeof DailyQuerySchema>;

/**
 * Endpoints de eventos/timeline/sync (docs/17_API_Design.md §events + §sync).
 * Todas as rotas exigem access token e são escopadas pelo userId autenticado.
 */
@Controller('events')
@UseGuards(AccessTokenGuard)
export class EventsController {
  constructor(
    private readonly ingest: IngestEventUseCase,
    private readonly ingestBatch: IngestEventBatchUseCase,
    private readonly timeline: GetTimelineUseCase,
    private readonly pullSync: PullSyncUseCase,
    private readonly dailySummary: GetDailySummaryUseCase,
  ) {}

  @Post()
  async ingestEvent(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(IngestEventSchema)) body: z.infer<typeof IngestEventSchema>,
  ) {
    const result = await this.ingest.execute({ userId, ...body });
    return { created: result.created, event: result.event };
  }

  /**
   * Ingestão em lote (docs/17 `POST /events:batch`).
   * Path `/events/batch` — semanticamente equivalente (Nest evita `:` na rota).
   */
  @Post('batch')
  async ingestBatchEvents(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(IngestEventBatchSchema))
    body: z.infer<typeof IngestEventBatchSchema>,
  ) {
    const result = await this.ingestBatch.execute(userId, body.events);
    return {
      items: result.items.map((r) => ({ created: r.created, event: r.event })),
    };
  }

  @Get('timeline')
  async getTimeline(
    @CurrentUser() userId: string,
    @Query(new ZodValidationPipe(TimelineQuerySchema)) query: TimelineQueryDto,
  ) {
    return this.timeline.execute({
      userId,
      limit: query.limit,
      cursor: query.cursor,
      types: query.type?.split(',').map((t) => t.trim()).filter(Boolean),
      from: query.from,
      to: query.to,
    });
  }

  @Get('sync')
  async syncPull(
    @CurrentUser() userId: string,
    @Query(new ZodValidationPipe(SyncQuerySchema)) query: SyncQueryDto,
  ) {
    return this.pullSync.execute({
      userId,
      since: query.since,
      limit: query.limit,
    });
  }

  @Get('daily')
  async getDaily(
    @CurrentUser() userId: string,
    @Query(new ZodValidationPipe(DailyQuerySchema)) query: DailyQueryDto,
  ) {
    return this.dailySummary.execute(userId, query.day);
  }
}
