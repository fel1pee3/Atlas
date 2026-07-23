import { Injectable } from '@nestjs/common';
import { AppendResult } from '../domain/event.repository';
import { IngestEventCommand, IngestEventUseCase } from './ingest-event.usecase';

/**
 * Ingestão em lote (docs/17 §4.2 / §4.9).
 * Reusa IngestEventUseCase por item — validação, idempotência e projeção
 * permanecem idênticas ao caminho unitário (sem atalho que desvie das invariantes).
 */
@Injectable()
export class IngestEventBatchUseCase {
  constructor(private readonly ingest: IngestEventUseCase) {}

  async execute(
    userId: string,
    events: Omit<IngestEventCommand, 'userId'>[],
  ): Promise<{ items: AppendResult[] }> {
    const items: AppendResult[] = [];
    for (const ev of events) {
      items.push(await this.ingest.execute({ userId, ...ev }));
    }
    return { items };
  }
}
