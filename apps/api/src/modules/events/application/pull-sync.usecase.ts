import { Injectable } from '@nestjs/common';
import { EventRepository, SyncPullPage } from '../domain/event.repository';

export interface PullSyncQuery {
  userId: string;
  since?: string;
  limit?: number;
}

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;

/**
 * Caso de uso: sync pull incremental (docs/08_Mobile_Architecture.md §7.5).
 * Cursor = ingestedAt (não offset) — estável sob ingestão concorrente.
 */
@Injectable()
export class PullSyncUseCase {
  constructor(private readonly events: EventRepository) {}

  async execute(query: PullSyncQuery): Promise<SyncPullPage> {
    const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    return this.events.pullSince({
      userId: query.userId,
      since: query.since,
      limit,
    });
  }
}
