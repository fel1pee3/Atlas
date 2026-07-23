import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import {
  EmbeddingOwnerType,
  EmbeddingRepository,
  SemanticHit,
  UpsertEmbeddingInput,
} from '../domain/embedding.repository';

/** Formata vetor para literal pgvector: [0.1,0.2,...] */
export function toPgvectorLiteral(vector: number[]): string {
  return `[${vector.join(',')}]`;
}

@Injectable()
export class PrismaEmbeddingRepository extends EmbeddingRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findCachedVector(contentHash: string, model: string): Promise<number[] | null> {
    const rows = await this.prisma.$queryRaw<Array<{ embedding: string }>>`
      SELECT embedding::text AS embedding
      FROM embedding_cache
      WHERE content_hash = ${contentHash} AND model = ${model}
      LIMIT 1
    `;
    if (!rows[0]?.embedding) return null;
    return parsePgvectorText(rows[0].embedding);
  }

  async hasCurrent(
    ownerType: EmbeddingOwnerType,
    ownerId: string,
    model: string,
    contentHash: string,
  ): Promise<boolean> {
    const count = await this.prisma.embedding.count({
      where: { ownerType, ownerId, model, contentHash },
    });
    return count > 0;
  }

  async upsert(input: UpsertEmbeddingInput): Promise<void> {
    const lit = toPgvectorLiteral(input.vector);
    const id = randomUUID();

    await this.prisma.$executeRaw`
      INSERT INTO embedding_cache (content_hash, model, embedding)
      VALUES (${input.contentHash}, ${input.model}, ${lit}::vector)
      ON CONFLICT (content_hash, model)
      DO UPDATE SET embedding = EXCLUDED.embedding
    `;

    await this.prisma.$executeRaw`
      INSERT INTO embeddings (id, user_id, owner_type, owner_id, content_hash, model, embedding)
      VALUES (
        ${id}::uuid,
        ${input.userId}::uuid,
        ${input.ownerType},
        ${input.ownerId}::uuid,
        ${input.contentHash},
        ${input.model},
        ${lit}::vector
      )
      ON CONFLICT (owner_type, owner_id, model)
      DO UPDATE SET
        content_hash = EXCLUDED.content_hash,
        embedding = EXCLUDED.embedding,
        user_id = EXCLUDED.user_id
    `;
  }

  async searchSemantic(
    userId: string,
    queryVector: number[],
    model: string,
    limit: number,
  ): Promise<SemanticHit[]> {
    const lit = toPgvectorLiteral(queryVector);
    const rows = await this.prisma.$queryRaw<
      Array<{
        owner_type: string;
        owner_id: string;
        content_hash: string;
        distance: number;
      }>
    >`
      SELECT
        owner_type,
        owner_id::text AS owner_id,
        content_hash,
        (embedding <=> ${lit}::vector) AS distance
      FROM embeddings
      WHERE user_id = ${userId}::uuid AND model = ${model}
      ORDER BY embedding <=> ${lit}::vector
      LIMIT ${limit}
    `;

    return rows.map((r) => ({
      ownerType: r.owner_type as EmbeddingOwnerType,
      ownerId: r.owner_id,
      contentHash: r.content_hash,
      distance: Number(r.distance),
      similarity: 1 - Number(r.distance),
    }));
  }
}

function parsePgvectorText(text: string): number[] {
  const trimmed = text.trim().replace(/^\[/, '').replace(/\]$/, '');
  if (!trimmed) return [];
  return trimmed.split(',').map((s) => Number(s.trim()));
}
