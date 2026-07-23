/**
 * Porta de embeddings (ADR-0006, docs/12 / docs/14).
 * Provedores concretos: Gemini (tier gratuito) ou none.
 */

export type EmbeddingTask = 'document' | 'query';

export abstract class EmbeddingProvider {
  /** Identificador estável do modelo (inclui dimensão), usado em cache/índice. */
  abstract readonly modelId: string;

  abstract readonly dimensions: number;

  /** false quando EMBEDDING_PROVIDER=none — indexação e busca semântica ficam off. */
  abstract isEnabled(): boolean;

  abstract embed(text: string, task: EmbeddingTask): Promise<number[]>;
}
