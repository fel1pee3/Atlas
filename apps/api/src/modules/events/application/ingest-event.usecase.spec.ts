import { IngestEventUseCase } from './ingest-event.usecase';
import {
  AppendEventInput,
  AppendResult,
  EventRepository,
  SyncPullPage,
  SyncPullQuery,
  TimelinePage,
  TimelineQuery,
  EventRecord,
} from '../domain/event.repository';
import { DailyProjectionPort, DailySummary } from '../domain/daily-projection.port';
import { EVENT_SOURCES, EVENT_TYPES } from '@atlas/shared';

/** Repositório fake em memória — testa o caso de uso sem banco (docs/26_Testing.md). */
class InMemoryEventRepository extends EventRepository {
  public appended: AppendEventInput[] = [];

  async append(input: AppendEventInput): Promise<AppendResult> {
    this.appended.push(input);
    return {
      created: true,
      event: {
        ...input,
        id: '00000000-0000-0000-0000-000000000001',
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
  public applied: Array<{
    userId: string;
    type: string;
    occurredAt: Date;
    payload: Record<string, unknown>;
  }> = [];

  async applyEvent(input: {
    userId: string;
    type: string;
    occurredAt: Date;
    payload: Record<string, unknown>;
  }): Promise<void> {
    this.applied.push(input);
  }

  async rebuildDay(_userId: string, _day: string): Promise<void> {}

  async getDailySummary(userId: string, day: string): Promise<DailySummary> {
    return { day, mood: null, expense: null, sleep: null, activity: null, places: null, calendar: null };
  }
}

describe('IngestEventUseCase', () => {
  const userId = '11111111-1111-1111-1111-111111111111';
  let repo: InMemoryEventRepository;
  let projections: FakeDailyProjection;
  let useCase: IngestEventUseCase;

  beforeEach(() => {
    repo = new InMemoryEventRepository();
    projections = new FakeDailyProjection();
    useCase = new IngestEventUseCase(repo, projections);
  });

  it('valida o payload e persiste um evento de humor manual', async () => {
    const result = await useCase.execute({
      userId,
      type: EVENT_TYPES.MANUAL_MOOD,
      source: EVENT_SOURCES.MANUAL,
      occurredAt: '2026-07-21T12:00:00.000Z',
      payload: { score: 4 },
    });

    expect(result.created).toBe(true);
    expect(repo.appended).toHaveLength(1);
    expect(repo.appended[0].payload).toEqual({ score: 4 });
    expect(projections.applied).toHaveLength(1);
    expect(projections.applied[0].type).toBe(EVENT_TYPES.MANUAL_MOOD);
  });

  it('rejeita payload inválido (mood score fora de 1..5)', async () => {
    await expect(
      useCase.execute({
        userId,
        type: EVENT_TYPES.MANUAL_MOOD,
        source: EVENT_SOURCES.MANUAL,
        occurredAt: '2026-07-21T12:00:00.000Z',
        payload: { score: 99 },
      }),
    ).rejects.toThrow();
    expect(repo.appended).toHaveLength(0);
    expect(projections.applied).toHaveLength(0);
  });

  it('rejeita tipo de evento desconhecido', async () => {
    await expect(
      useCase.execute({
        userId,
        type: 'foo.bar',
        source: EVENT_SOURCES.MANUAL,
        occurredAt: '2026-07-21T12:00:00.000Z',
        payload: {},
      }),
    ).rejects.toThrow(/desconhecido/);
  });

  it('não projeta quando o evento já existia (created=false)', async () => {
    const idempotentRepo = new (class extends InMemoryEventRepository {
      async append(input: AppendEventInput): Promise<AppendResult> {
        this.appended.push(input);
        return {
          created: false,
          event: {
            ...input,
            id: '00000000-0000-0000-0000-000000000001',
            ingestedAt: new Date(),
          },
        };
      }
    })();
    const uc = new IngestEventUseCase(idempotentRepo, projections);

    await uc.execute({
      userId,
      type: EVENT_TYPES.MANUAL_MOOD,
      source: EVENT_SOURCES.MANUAL,
      externalId: 'local-1',
      occurredAt: '2026-07-21T12:00:00.000Z',
      payload: { score: 3 },
    });

    expect(projections.applied).toHaveLength(0);
  });
});
