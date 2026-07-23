import { createHash } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { eventToEmbeddableText, insightToEmbeddableText } from '@atlas/shared';
import { EmbeddingProvider } from '../../ai/domain/embedding.provider';
import {
  EmbeddingOwnerType,
  EmbeddingRepository,
} from '../domain/embedding.repository';

/**
 * Indexa texto no pgvector com cache por hash (docs/14 §8, docs/20 M6).
 * Falhas de rede/API não propagam para ingestão — só logam.
 */
@Injectable()
export class IndexDocumentUseCase {
  private readonly logger = new Logger(IndexDocumentUseCase.name);

  constructor(
    private readonly embeddings: EmbeddingProvider,
    private readonly repo: EmbeddingRepository,
  ) {}

  async indexEventSafe(
    userId: string,
    eventId: string,
    type: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const text = eventToEmbeddableText(type, payload);
    if (!text) return;
    await this.indexSafe(userId, 'event', eventId, text);
  }

  async indexInsightSafe(
    userId: string,
    insightId: string,
    title: string,
    body: string,
  ): Promise<void> {
    const text = insightToEmbeddableText(title, body);
    if (!text) return;
    await this.indexSafe(userId, 'insight', insightId, text);
  }

  private async indexSafe(
    userId: string,
    ownerType: EmbeddingOwnerType,
    ownerId: string,
    text: string,
  ): Promise<void> {
    try {
      await this.index(userId, ownerType, ownerId, text);
    } catch (err) {
      this.logger.warn(
        `Falha ao indexar ${ownerType}/${ownerId}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  async index(
    userId: string,
    ownerType: EmbeddingOwnerType,
    ownerId: string,
    text: string,
  ): Promise<'skipped' | 'cached' | 'embedded'> {
    if (!this.embeddings.isEnabled()) return 'skipped';

    const model = this.embeddings.modelId;
    const contentHash = sha256(text);

    if (await this.repo.hasCurrent(ownerType, ownerId, model, contentHash)) {
      return 'cached';
    }

    let vector = await this.repo.findCachedVector(contentHash, model);
    let status: 'cached' | 'embedded' = 'cached';
    if (!vector) {
      vector = await this.embeddings.embed(text, 'document');
      status = 'embedded';
    }

    await this.repo.upsert({
      userId,
      ownerType,
      ownerId,
      contentHash,
      model,
      vector,
    });
    return status;
  }
}

export function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}
