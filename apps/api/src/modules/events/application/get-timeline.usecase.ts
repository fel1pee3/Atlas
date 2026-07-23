import { Injectable } from '@nestjs/common';
import { EventRepository, TimelinePage } from '../domain/event.repository';

export interface GetTimelineQuery {
  userId: string;
  limit?: number;
  cursor?: string;
  types?: string[];
  from?: string;
  to?: string;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

/**
 * Caso de uso: ler a timeline unificada (docs/20_MVP.md §2.3).
 * Paginação por cursor (occurredAt desc) — estável mesmo com ingestão contínua.
 */
@Injectable()
export class GetTimelineUseCase {
  constructor(private readonly events: EventRepository) {}

  async execute(query: GetTimelineQuery): Promise<TimelinePage> {
    const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    return this.events.timeline({
      userId: query.userId,
      limit,
      cursor: query.cursor,
      types: query.types,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });
  }
}
