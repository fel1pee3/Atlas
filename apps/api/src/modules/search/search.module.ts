import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { SearchController } from './interface/search.controller';
import { IndexDocumentUseCase } from './application/index-document.usecase';
import { SearchUseCase } from './application/search.usecase';
import { ReindexUseCase } from './application/reindex.usecase';
import { EmbeddingRepository } from './domain/embedding.repository';
import { PrismaEmbeddingRepository } from './infrastructure/prisma-embedding.repository';

/**
 * Bounded context de Busca semântica (M6 — docs/14, docs/20).
 */
@Module({
  imports: [AiModule],
  controllers: [SearchController],
  providers: [
    IndexDocumentUseCase,
    SearchUseCase,
    ReindexUseCase,
    { provide: EmbeddingRepository, useClass: PrismaEmbeddingRepository },
  ],
  exports: [IndexDocumentUseCase],
})
export class SearchModule {}
