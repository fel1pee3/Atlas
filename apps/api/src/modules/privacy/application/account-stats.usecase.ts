import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';

export interface AccountStats {
  usefulThisWeek: number;
  usefulTotal: number;
  activeInsights: number;
  dismissedTotal: number;
  eventsTotal: number;
  weekStart: string;
  northStarMet: boolean;
}

/**
 * North Star proxy (docs/00 §11, docs/20 M8): insights marcados úteis na semana.
 */
@Injectable()
export class AccountStatsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<AccountStats> {
    const weekStart = startOfUtcWeek(new Date());

    const [usefulThisWeek, usefulTotal, activeInsights, dismissedTotal, eventsTotal] =
      await Promise.all([
        this.prisma.insight.count({
          where: { userId, status: 'useful', updatedAt: { gte: weekStart } },
        }),
        this.prisma.insight.count({ where: { userId, status: 'useful' } }),
        this.prisma.insight.count({ where: { userId, status: 'active' } }),
        this.prisma.insight.count({ where: { userId, status: 'dismissed' } }),
        this.prisma.event.count({ where: { userId } }),
      ]);

    return {
      usefulThisWeek,
      usefulTotal,
      activeInsights,
      dismissedTotal,
      eventsTotal,
      weekStart: weekStart.toISOString(),
      northStarMet: usefulThisWeek >= 1,
    };
  }
}

/** Segunda-feira 00:00 UTC da semana corrente. */
function startOfUtcWeek(now: Date): Date {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = d.getUTCDay(); // 0=dom
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}
