import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { eventToEmbeddableText } from '@atlas/shared';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { EmbeddingProvider } from '../../ai/domain/embedding.provider';
import { IndexDocumentUseCase } from './index-document.usecase';

/**
 * Reindexa eventos/insights existentes (útil após ligar GEMINI_API_KEY).
 */
@Injectable()
export class ReindexUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddings: EmbeddingProvider,
    private readonly index: IndexDocumentUseCase,
  ) {}

  async execute(userId: string): Promise<{
    eventsConsidered: number;
    eventsIndexed: number;
    insightsIndexed: number;
    skipped: number;
    embedded: number;
    cached: number;
  }> {
    if (!this.embeddings.isEnabled()) {
      throw new ServiceUnavailableException(
        'Reindex exige EMBEDDING_PROVIDER=gemini e GEMINI_API_KEY.',
      );
    }

    let eventsConsidered = 0;
    let eventsIndexed = 0;
    let insightsIndexed = 0;
    let skipped = 0;
    let embedded = 0;
    let cached = 0;

    const events = await this.prisma.event.findMany({
      where: { userId },
      select: { id: true, type: true, payload: true },
      orderBy: { occurredAt: 'desc' },
      take: 5_000,
    });

    for (const ev of events) {
      eventsConsidered += 1;
      const text = eventToEmbeddableText(ev.type, ev.payload as Record<string, unknown>);
      if (!text) {
        skipped += 1;
        continue;
      }
      const status = await this.index.index(userId, 'event', ev.id, text);
      if (status === 'skipped') skipped += 1;
      else {
        eventsIndexed += 1;
        if (status === 'embedded') embedded += 1;
        else cached += 1;
      }
    }

    const insights = await this.prisma.insight.findMany({
      where: { userId },
      select: { id: true, title: true, body: true },
      take: 2_000,
    });

    for (const ins of insights) {
      const status = await this.index.index(
        userId,
        'insight',
        ins.id,
        `${ins.title}\n${ins.body}`,
      );
      if (status === 'skipped') skipped += 1;
      else {
        insightsIndexed += 1;
        if (status === 'embedded') embedded += 1;
        else cached += 1;
      }
    }

    return {
      eventsConsidered,
      eventsIndexed,
      insightsIndexed,
      skipped,
      embedded,
      cached,
    };
  }
}
