import { IngestEventBatchUseCase } from './ingest-event-batch.usecase';
import { IngestEventUseCase } from './ingest-event.usecase';
import {
  AppendEventInput,
  AppendResult,
  EventRecord,
  EventRepository,
  SyncPullPage,
  SyncPullQuery,
  TimelinePage,
  TimelineQuery,
} from '../domain/event.repository';
import { DailyProjectionPort, DailySummary } from '../domain/daily-projection.port';
import { EVENT_SOURCES, EVENT_TYPES } from '@atlas/shared';

class InMemoryEventRepository extends EventRepository {
  public appended: AppendEventInput[] = [];

  async append(input: AppendEventInput): Promise<AppendResult> {
    this.appended.push(input);
    return {
      created: true,
      event: {
        ...input,
        id: `00000000-0000-0000-0000-${String(this.appended.length).padStart(12, '0')}`,
        ingestedAt: new Date(),
      },
    };
  }

  async timeline(_query: TimelineQuery): Promise<TimelinePage> {
    return { items: [], nextCursor: null };
  }

  async pullSince(_query: SyncPullQuery): Promise<SyncPullPage> {
    return { items: [], nextSince: null, hasMore: false };
  }

  async listByUserAndDay(_userId: string, _day: string): Promise<EventRecord[]> {
    return [];
  }

  async listByUserTypes(
    _userId: string,
    _types: string[],
    _from: Date,
    _to: Date,
  ): Promise<EventRecord[]> {
    return [];
  }
}

class FakeDailyProjection extends DailyProjectionPort {
  public applied = 0;

  async applyEvent(): Promise<void> {
    this.applied += 1;
  }

  async rebuildDay(): Promise<void> {}

  async getDailySummary(userId: string, day: string): Promise<DailySummary> {
    return { day, mood: null, expense: null, sleep: null, activity: null, places: null, calendar: null };
  }
}

describe('IngestEventBatchUseCase', () => {
  it('ingere o lote e projeta cada evento criado', async () => {
    const repo = new InMemoryEventRepository();
    const projections = new FakeDailyProjection();
    const ingest = new IngestEventUseCase(repo, projections);
    const batch = new IngestEventBatchUseCase(ingest);
    const userId = '11111111-1111-1111-1111-111111111111';

    const result = await batch.execute(userId, [
      {
        type: EVENT_TYPES.SLEEP_RECORDED,
        source: EVENT_SOURCES.DEMO,
        externalId: 'demo:sleep:2026-07-20',
        occurredAt: '2026-07-20T07:00:00.000Z',
        payload: { durationMin: 420 },
      },
      {
        type: EVENT_TYPES.ACTIVITY_STEPS,
        source: EVENT_SOURCES.DEMO,
        externalId: 'demo:steps:2026-07-20',
        occurredAt: '2026-07-20T23:00:00.000Z',
        payload: { steps: 8000 },
      },
    ]);

    expect(result.items).toHaveLength(2);
    expect(result.items.every((i) => i.created)).toBe(true);
    expect(projections.applied).toBe(2);
    expect(repo.appended[0].type).toBe(EVENT_TYPES.SLEEP_RECORDED);
  });
});
