import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';

/**
 * Export total do CMHL do usuário (docs/15 §7, docs/20 M7).
 * JSON aberto, reimportável em espírito (portabilidade).
 */
@Injectable()
export class ExportAccountUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('Conta não encontrada');

    const [events, insights, embeddings] = await Promise.all([
      this.prisma.event.findMany({
        where: { userId },
        orderBy: { occurredAt: 'asc' },
        select: {
          id: true,
          type: true,
          source: true,
          externalId: true,
          occurredAt: true,
          ingestedAt: true,
          payload: true,
        },
      }),
      this.prisma.insight.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          kind: true,
          fingerprint: true,
          title: true,
          body: true,
          confidence: true,
          method: true,
          status: true,
          createdAt: true,
          evidence: { select: { eventId: true, weight: true } },
        },
      }),
      this.prisma.embedding.findMany({
        where: { userId },
        select: {
          id: true,
          ownerType: true,
          ownerId: true,
          contentHash: true,
          model: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      format: 'atlas.cmhl.export.v1',
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
      events: events.map((e) => ({
        ...e,
        occurredAt: e.occurredAt.toISOString(),
        ingestedAt: e.ingestedAt.toISOString(),
      })),
      insights: insights.map((i) => ({
        ...i,
        createdAt: i.createdAt.toISOString(),
      })),
      embeddingsIndex: embeddings.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
      })),
      counts: {
        events: events.length,
        insights: insights.length,
        embeddings: embeddings.length,
      },
    };
  }
}
