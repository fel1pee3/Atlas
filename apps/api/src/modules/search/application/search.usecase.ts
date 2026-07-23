import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { EmbeddingProvider } from '../../ai/domain/embedding.provider';
import { EmbeddingRepository } from '../domain/embedding.repository';

export interface SearchResultItem {
  kind: 'event' | 'insight';
  id: string;
  score: number;
  title: string;
  snippet: string;
  type?: string;
  occurredAt?: string;
  method?: string;
}

export interface SearchResult {
  mode: 'semantic' | 'keyword';
  query: string;
  provider: string;
  items: SearchResultItem[];
}

/**
 * Busca semântica (pgvector) ou lexical (ILIKE) — docs/17 §4.6, docs/20 M6.
 */
@Injectable()
export class SearchUseCase {
  constructor(
    private readonly embeddings: EmbeddingProvider,
    private readonly repo: EmbeddingRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    userId: string,
    query: string,
    mode: 'semantic' | 'keyword' = 'semantic',
    limit = 20,
  ): Promise<SearchResult> {
    const q = query.trim();
    if (q.length < 2) {
      throw new BadRequestException('Query deve ter ao menos 2 caracteres');
    }
    const capped = Math.min(Math.max(limit, 1), 50);

    if (mode === 'keyword') {
      return {
        mode: 'keyword',
        query: q,
        provider: 'postgres',
        items: await this.keywordSearch(userId, q, capped),
      };
    }

    if (!this.embeddings.isEnabled()) {
      throw new ServiceUnavailableException(
        'Busca semântica indisponível. Defina EMBEDDING_PROVIDER=gemini e GEMINI_API_KEY, ou use mode=keyword.',
      );
    }

    const vector = await this.embeddings.embed(q, 'query');
    const hits = await this.repo.searchSemantic(
      userId,
      vector,
      this.embeddings.modelId,
      capped,
    );
    const items = await this.hydrateHits(userId, hits);

    return {
      mode: 'semantic',
      query: q,
      provider: this.embeddings.modelId,
      items,
    };
  }

  private async hydrateHits(
    userId: string,
    hits: Array<{ ownerType: string; ownerId: string; similarity: number }>,
  ): Promise<SearchResultItem[]> {
    const eventIds = hits.filter((h) => h.ownerType === 'event').map((h) => h.ownerId);
    const insightIds = hits.filter((h) => h.ownerType === 'insight').map((h) => h.ownerId);

    const [events, insights] = await Promise.all([
      eventIds.length
        ? this.prisma.event.findMany({
            where: { userId, id: { in: eventIds } },
          })
        : [],
      insightIds.length
        ? this.prisma.insight.findMany({
            where: { userId, id: { in: insightIds } },
          })
        : [],
    ]);

    const eventMap = new Map(events.map((e) => [e.id, e]));
    const insightMap = new Map(insights.map((i) => [i.id, i]));
    const items: SearchResultItem[] = [];

    for (const hit of hits) {
      if (hit.ownerType === 'event') {
        const ev = eventMap.get(hit.ownerId);
        if (!ev) continue;
        const payload = ev.payload as Record<string, unknown>;
        items.push({
          kind: 'event',
          id: ev.id,
          score: hit.similarity,
          title: ev.type,
          snippet: snippetFromPayload(ev.type, payload),
          type: ev.type,
          occurredAt: ev.occurredAt.toISOString(),
        });
      } else {
        const ins = insightMap.get(hit.ownerId);
        if (!ins) continue;
        items.push({
          kind: 'insight',
          id: ins.id,
          score: hit.similarity,
          title: ins.title,
          snippet: ins.body.slice(0, 240),
          method: ins.method,
        });
      }
    }
    return items;
  }

  private async keywordSearch(
    userId: string,
    query: string,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const pattern = `%${escapeLike(query)}%`;
    const events = await this.prisma.$queryRaw<
      Array<{
        id: string;
        type: string;
        occurred_at: Date;
        payload: unknown;
      }>
    >`
      SELECT id::text AS id, type, occurred_at, payload
      FROM events
      WHERE user_id = ${userId}::uuid
        AND payload::text ILIKE ${pattern}
      ORDER BY occurred_at DESC
      LIMIT ${limit}
    `;

    const insights = await this.prisma.$queryRaw<
      Array<{ id: string; title: string; body: string; method: string }>
    >`
      SELECT id::text AS id, title, body, method
      FROM insights
      WHERE user_id = ${userId}::uuid
        AND (title ILIKE ${pattern} OR body ILIKE ${pattern})
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    const items: SearchResultItem[] = [
      ...events.map((ev) => ({
        kind: 'event' as const,
        id: ev.id,
        score: 0.5,
        title: ev.type,
        snippet: snippetFromPayload(ev.type, ev.payload as Record<string, unknown>),
        type: ev.type,
        occurredAt: new Date(ev.occurred_at).toISOString(),
      })),
      ...insights.map((ins) => ({
        kind: 'insight' as const,
        id: ins.id,
        score: 0.5,
        title: ins.title,
        snippet: ins.body.slice(0, 240),
        method: ins.method,
      })),
    ];

    return items.slice(0, limit);
  }
}

function snippetFromPayload(type: string, payload: Record<string, unknown>): string {
  if (type === 'manual.note') return String(payload.text ?? '').slice(0, 240);
  if (type === 'calendar.event') return String(payload.title ?? '').slice(0, 240);
  if (type === 'location.visited') return String(payload.label ?? type).slice(0, 240);
  if (type === 'manual.mood' && payload.note) return String(payload.note).slice(0, 240);
  return JSON.stringify(payload).slice(0, 240);
}

function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, '\\$&');
}
