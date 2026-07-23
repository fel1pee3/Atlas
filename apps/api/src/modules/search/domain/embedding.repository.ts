export type EmbeddingOwnerType = 'event' | 'insight';

export interface UpsertEmbeddingInput {
  userId: string;
  ownerType: EmbeddingOwnerType;
  ownerId: string;
  contentHash: string;
  model: string;
  vector: number[];
}

export interface SemanticHit {
  ownerType: EmbeddingOwnerType;
  ownerId: string;
  contentHash: string;
  distance: number;
  similarity: number;
}

export abstract class EmbeddingRepository {
  /** Vetor em cache global por (contentHash, model), se existir. */
  abstract findCachedVector(contentHash: string, model: string): Promise<number[] | null>;

  /** Upsert do índice do owner + grava/atualiza cache. */
  abstract upsert(input: UpsertEmbeddingInput): Promise<void>;

  /** true se já indexado com o mesmo hash (skip API). */
  abstract hasCurrent(
    ownerType: EmbeddingOwnerType,
    ownerId: string,
    model: string,
    contentHash: string,
  ): Promise<boolean>;

  abstract searchSemantic(
    userId: string,
    queryVector: number[],
    model: string,
    limit: number,
  ): Promise<SemanticHit[]>;
}
