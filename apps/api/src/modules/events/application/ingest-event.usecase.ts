import { Injectable } from '@nestjs/common';
import { validatePayload } from '@atlas/shared';
import {
  AppendResult,
  EventRepository,
} from '../domain/event.repository';
import { DailyProjectionPort } from '../domain/daily-projection.port';
import { IndexDocumentUseCase } from '../../search/application/index-document.usecase';

export interface IngestEventCommand {
  userId: string;
  type: string;
  source: string;
  externalId?: string | null;
  occurredAt: string;
  payload: Record<string, unknown>;
}

/**
 * Caso de uso: ingerir um evento (docs/11_Event_Model.md §4).
 * Regras: valida payload por tipo; persiste idempotente; projeta read models
 * diários quando created=true (docs/11 §5.1); indexa texto no M6 (best-effort).
 */
@Injectable()
export class IngestEventUseCase {
  constructor(
    private readonly events: EventRepository,
    private readonly projections: DailyProjectionPort,
    private readonly indexer: IndexDocumentUseCase,
  ) {}

  async execute(cmd: IngestEventCommand): Promise<AppendResult> {
    const payload = validatePayload(cmd.type, cmd.payload);

    const result = await this.events.append({
      userId: cmd.userId,
      type: cmd.type,
      source: cmd.source,
      externalId: cmd.externalId ?? null,
      occurredAt: new Date(cmd.occurredAt),
      payload,
    });

    if (result.created) {
      await this.projections.applyEvent({
        userId: result.event.userId,
        type: result.event.type,
        occurredAt: result.event.occurredAt,
        payload: result.event.payload,
      });
      // Embeddings (Gemini) em background — não bloquear HTTP/batch (celular abortava ~2min → 499).
      void this.indexer
        .indexEventSafe(
          result.event.userId,
          result.event.id,
          result.event.type,
          result.event.payload,
        )
        .catch(() => undefined);
    }

    return result;
  }
}
