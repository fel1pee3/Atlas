import { z } from 'zod';
import { INSIGHT_STATUSES } from './insight-types';

export const InsightFeedbackSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('useful') }),
  z.object({ action: z.literal('dismiss') }),
  z.object({ action: z.literal('reactivate') }),
]);

export type InsightFeedbackInput = z.infer<typeof InsightFeedbackSchema>;

export const InsightStatusFilterSchema = z
  .enum([
    INSIGHT_STATUSES.ACTIVE,
    INSIGHT_STATUSES.DISMISSED,
    INSIGHT_STATUSES.USEFUL,
  ])
  .optional();
