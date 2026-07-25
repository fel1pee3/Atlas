import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma';
import { PrismaService } from '../../../shared/prisma/prisma.service';
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
import { parseDayKey } from '../domain/day-key';

interface CursorPayload {
  o: string; // occurredAt ISO
  id: string;
}

/**
 * Implementação Prisma/PostgreSQL do EventRepository (docs/10_Database_Design.md).
 * - `append` é idempotente: colisão em (userId, source, externalId) retorna created=false.
 * - `timeline` pagina por (occurredAt desc, id desc) usando cursor opaco.
 */
@Injectable()
export class PrismaEventRepository extends EventRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async append(input: AppendEventInput): Promise<AppendResult> {
    try {
      const row = await this.prisma.event.create({
        data: {
          userId: input.userId,
          type: input.type,
          source: input.source,
          externalId: input.externalId,
          occurredAt: input.occurredAt,
          payload: input.payload as Prisma.InputJsonValue,
        },
      });
      return { event: this.toRecord(row), created: true };
    } catch (err) {
      // P2002 = violação de unique (idempotência): o evento já existe.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002' &&
        input.externalId !== null
      ) {
        const existing = await this.prisma.event.findFirst({
          where: {
            userId: input.userId,
            source: input.source,
            externalId: input.externalId,
          },
        });
        if (existing) return { event: this.toRecord(existing), created: false };
      }
      throw err;
    }
  }

  async timeline(query: TimelineQuery): Promise<TimelinePage> {
    const where: Prisma.EventWhereInput = { userId: query.userId };
    if (query.types?.length) where.type = { in: query.types };
    if (query.from || query.to) {
      where.occurredAt = {};
      if (query.from) where.occurredAt.gte = query.from;
      if (query.to) where.occurredAt.lte = query.to;
    }

    const cursor = query.cursor ? this.decodeCursor(query.cursor) : null;
    if (cursor) {
      // Registros "após" o cursor na ordem (occurredAt desc, id desc).
      where.OR = [
        { occurredAt: { lt: new Date(cursor.o) } },
        { occurredAt: new Date(cursor.o), id: { lt: cursor.id } },
      ];
    }

    const rows = await this.prisma.event.findMany({
      where,
      orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
    });

    const hasMore = rows.length > query.limit;
    const page = hasMore ? rows.slice(0, query.limit) : rows;
    const last = page.at(-1);
    const nextCursor =
      hasMore && last ? this.encodeCursor({ o: last.occurredAt.toISOString(), id: last.id }) : null;

    return { items: page.map((r) => this.toRecord(r)), nextCursor };
  }

  /**
   * Pull incremental por ingestedAt (docs/08 §7.5 adaptado).
   * Eventos são append-only: ingestedAt é o cursor estável (docs' updated_at
   * aplica-se a entidades mutáveis; aqui o fato nasce uma vez).
   */
  async pullSince(query: SyncPullQuery): Promise<SyncPullPage> {
    const where: Prisma.EventWhereInput = { userId: query.userId };
    if (query.since) {
      where.ingestedAt = { gt: new Date(query.since) };
    }

    const rows = await this.prisma.event.findMany({
      where,
      orderBy: [{ ingestedAt: 'asc' }, { id: 'asc' }],
      take: query.limit + 1,
    });

    const hasMore = rows.length > query.limit;
    const page = hasMore ? rows.slice(0, query.limit) : rows;
    const last = page.at(-1);
    const nextSince = last ? last.ingestedAt.toISOString() : query.since ?? null;

    return {
      items: page.map((r) => this.toRecord(r)),
      nextSince,
      hasMore,
    };
  }

  async listByUserAndDay(userId: string, day: string): Promise<EventRecord[]> {
    const start = parseDayKey(day);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    const rows = await this.prisma.event.findMany({
      where: {
        userId,
        occurredAt: { gte: start, lt: end },
      },
      orderBy: [{ occurredAt: 'asc' }, { id: 'asc' }],
    });
    return rows.map((r) => this.toRecord(r));
  }

  async listByUserTypes(
    userId: string,
    types: string[],
    from: Date,
    to: Date,
  ): Promise<EventRecord[]> {
    const rows = await this.prisma.event.findMany({
      where: {
        userId,
        type: { in: types },
        occurredAt: { gte: from, lte: to },
      },
      orderBy: [{ occurredAt: 'asc' }, { id: 'asc' }],
    });
    return rows.map((r) => this.toRecord(r));
  }

  private toRecord(row: {
    id: string;
    userId: string;
    type: string;
    source: string;
    externalId: string | null;
    occurredAt: Date;
    ingestedAt: Date;
    payload: Prisma.JsonValue;
  }): EventRecord {
    return {
      id: row.id,
      userId: row.userId,
      type: row.type,
      source: row.source,
      externalId: row.externalId,
      occurredAt: row.occurredAt,
      ingestedAt: row.ingestedAt,
      payload: (row.payload ?? {}) as Record<string, unknown>,
    };
  }

  private encodeCursor(c: CursorPayload): string {
    return Buffer.from(JSON.stringify(c)).toString('base64url');
  }

  private decodeCursor(raw: string): CursorPayload | null {
    try {
      return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as CursorPayload;
    } catch {
      return null;
    }
  }
}
