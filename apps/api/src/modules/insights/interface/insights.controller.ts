import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { InsightFeedbackSchema } from '@atlas/shared';
import { z } from 'zod';
import { AccessTokenGuard } from '../../identity/interface/access-token.guard';
import { CurrentUser } from '../../identity/interface/current-user.decorator';
import { ZodValidationPipe } from '../../../shared/http/zod-validation.pipe';
import { GenerateInsightsUseCase } from '../application/generate-insights.usecase';
import { ListInsightsUseCase } from '../application/list-insights.usecase';
import { GetInsightUseCase } from '../application/get-insight.usecase';
import { InsightFeedbackUseCase } from '../application/insight-feedback.usecase';

const ListQuerySchema = z.object({
  status: z.string().optional(),
});

/**
 * Insights explicáveis (docs/17, docs/12 §7, docs/19 §7–8).
 * Geração sob demanda (MVP sem worker); evidências sempre inclusas no detalhe.
 */
@Controller('insights')
@UseGuards(AccessTokenGuard)
export class InsightsController {
  constructor(
    private readonly generate: GenerateInsightsUseCase,
    private readonly list: ListInsightsUseCase,
    private readonly getOne: GetInsightUseCase,
    private readonly feedback: InsightFeedbackUseCase,
  ) {}

  @Post('generate')
  async generateInsights(@CurrentUser() userId: string) {
    return this.generate.execute(userId);
  }

  @Get()
  async listInsights(
    @CurrentUser() userId: string,
    @Query(new ZodValidationPipe(ListQuerySchema)) query: z.infer<typeof ListQuerySchema>,
  ) {
    const items = await this.list.execute(userId, query.status);
    return { items };
  }

  @Get(':id')
  async getInsight(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.getOne.execute(userId, id);
  }

  @Post(':id/feedback')
  async postFeedback(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(InsightFeedbackSchema))
    body: z.infer<typeof InsightFeedbackSchema>,
  ) {
    return this.feedback.execute(userId, id, body.action);
  }
}
