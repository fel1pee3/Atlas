/**
 * PORT do domínio de Eventos (docs/09 §3.2). A camada de aplicação depende
 * desta abstração; a infraestrutura (Prisma) a implementa. É o que torna a
 * arquitetura reversível (trocar Postgres sem tocar no domínio).
 */

export interface EventRecord {
  id: string;
  userId: string;
  type: string;
  source: string;
  externalId: string | null;
  occurredAt: Date;
  ingestedAt: Date;
  payload: Record<string, unknown>;
}

export interface AppendEventInput {
  userId: string;
  type: string;
  source: string;
  externalId: string | null;
  occurredAt: Date;
  payload: Record<string, unknown>;
}

export interface AppendResult {
  event: EventRecord;
  /** false quando o evento já existia (idempotência por userId+source+externalId). */
  created: boolean;
}

export interface TimelineQuery {
  userId: string;
  limit: number;
  /** Cursor opaco (paginação por occurredAt desc + id). */
  cursor?: string;
  types?: string[];
  from?: Date;
  to?: Date;
}

export interface TimelinePage {
  items: EventRecord[];
  nextCursor: string | null;
}

export interface SyncPullQuery {
  userId: string;
  /** ISO ingestedAt — exclusivo (só eventos com ingestedAt > since). */
  since?: string;
  limit: number;
}

export interface SyncPullPage {
  items: EventRecord[];
  nextSince: string | null;
  hasMore: boolean;
}

/** Classe abstrata usada como token de injeção do NestJS. */
export abstract class EventRepository {
  abstract append(input: AppendEventInput): Promise<AppendResult>;
  abstract timeline(query: TimelineQuery): Promise<TimelinePage>;
  /** Pull incremental por ingestedAt (docs/08 §7.5 — cursor temporal). */
  abstract pullSince(query: SyncPullQuery): Promise<SyncPullPage>;
  abstract listByUserAndDay(userId: string, day: string): Promise<EventRecord[]>;
  /** Janela tipada para o motor de insights (M3). */
  abstract listByUserTypes(
    userId: string,
    types: string[],
    from: Date,
    to: Date,
  ): Promise<EventRecord[]>;
}
