import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { AccessTokenGuard } from '../../identity/interface/access-token.guard';
import { CurrentUser } from '../../identity/interface/current-user.decorator';
import { ZodValidationPipe } from '../../../shared/http/zod-validation.pipe';
import { SearchUseCase } from '../application/search.usecase';
import { ReindexUseCase } from '../application/reindex.usecase';

const SearchQuerySchema = z.object({
  q: z.string().min(1).max(500),
  mode: z.enum(['semantic', 'keyword']).optional().default('semantic'),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
});

/**
 * Busca semântica / lexical (docs/17 §4.6, docs/19 §9, docs/20 M6).
 */
@Controller('search')
@UseGuards(AccessTokenGuard)
export class SearchController {
  constructor(
    private readonly search: SearchUseCase,
    private readonly reindex: ReindexUseCase,
  ) {}

  @Get()
  async searchQuery(
    @CurrentUser() userId: string,
    @Query(new ZodValidationPipe(SearchQuerySchema))
    query: z.infer<typeof SearchQuerySchema>,
  ) {
    return this.search.execute(userId, query.q, query.mode, query.limit);
  }

  /** Reindexa CMHL textual do usuário (após ativar Gemini). */
  @Post('reindex')
  async reindexUser(@CurrentUser() userId: string) {
    return this.reindex.execute(userId);
  }
}
