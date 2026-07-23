import { Injectable } from '@nestjs/common';
import { EmbeddingProvider, EmbeddingTask } from '../domain/embedding.provider';

/** Provider desligado — dogfooding sem chave Gemini (M0–M5 continuam ok). */
@Injectable()
export class NoneEmbeddingProvider extends EmbeddingProvider {
  readonly modelId = 'none';
  readonly dimensions = 0;

  isEnabled(): boolean {
    return false;
  }

  async embed(_text: string, _task: EmbeddingTask): Promise<number[]> {
    throw new Error('Embeddings desligados (EMBEDDING_PROVIDER=none). Configure GEMINI_API_KEY.');
  }
}
