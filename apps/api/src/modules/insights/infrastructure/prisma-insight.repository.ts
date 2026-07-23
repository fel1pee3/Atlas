import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import {
  InsightCandidate,
  InsightDetail,
  InsightRecord,
  InsightRepository,
} from '../domain/insight.repository';

@Injectable()
export class PrismaInsightRepository extends InsightRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async upsertCandidate(userId: string, candidate: InsightCandidate): Promise<InsightRecord> {
    const existing = await this.prisma.insight.findUnique({
      where: {
        userId_fingerprint: { userId, fingerprint: candidate.fingerprint },
      },
    });

    // Não sobrescreve feedback do usuário (dismissed/useful).
    if (existing && existing.status !== 'active') {
      return this.toRecord(existing, []);
    }

    const row = await this.prisma.insight.upsert({
      where: {
        userId_fingerprint: { userId, fingerprint: candidate.fingerprint },
      },
      create: {
        userId,
        kind: candidate.kind,
        fingerprint: candidate.fingerprint,
        title: candidate.title,
        body: candidate.body,
        confidence: candidate.confidence,
        method: candidate.method,
        status: 'active',
        evidence: {
          create: candidate.evidence.map((e) => ({
            eventId: e.eventId,
            weight: e.weight,
          })),
        },
      },
      update: {
        title: candidate.title,
        body: candidate.body,
        confidence: candidate.confidence,
        method: candidate.method,
        kind: candidate.kind,
      },
      include: { evidence: true },
    });

    // Recria evidências no update (fonte da verdade = último fold).
    if (existing) {
      await this.prisma.insightEvidence.deleteMany({ where: { insightId: row.id } });
      if (candidate.evidence.length > 0) {
        await this.prisma.insightEvidence.createMany({
          data: candidate.evidence.map((e) => ({
            insightId: row.id,
            eventId: e.eventId,
            weight: e.weight,
          })),
          skipDuplicates: true,
        });
      }
      const refreshed = await this.prisma.insight.findUniqueOrThrow({
        where: { id: row.id },
        include: { evidence: true },
      });
      return this.toRecord(
        refreshed,
        refreshed.evidence.map((e) => ({ eventId: e.eventId, weight: e.weight ?? 1 })),
      );
    }

    return this.toRecord(
      row,
      row.evidence.map((e) => ({ eventId: e.eventId, weight: e.weight ?? 1 })),
    );
  }

  async listByUser(userId: string, status?: string): Promise<InsightRecord[]> {
    const rows = await this.prisma.insight.findMany({
      where: { userId, ...(status ? { status } : { status: { in: ['active', 'useful'] } }) },
      orderBy: [{ createdAt: 'desc' }],
      include: { evidence: true },
    });
    return rows.map((r) =>
      this.toRecord(
        r,
        r.evidence.map((e) => ({ eventId: e.eventId, weight: e.weight ?? 1 })),
      ),
    );
  }

  async findById(userId: string, id: string): Promise<InsightDetail | null> {
    const row = await this.prisma.insight.findFirst({
      where: { id, userId },
      include: {
        evidence: {
          include: { event: true },
        },
      },
    });
    if (!row) return null;

    return {
      ...this.toRecord(
        row,
        row.evidence.map((e) => ({ eventId: e.eventId, weight: e.weight ?? 1 })),
      ),
      evidenceEvents: row.evidence.map((e) => ({
        id: e.event.id,
        type: e.event.type,
        source: e.event.source,
        occurredAt: e.event.occurredAt,
        payload: (e.event.payload ?? {}) as Record<string, unknown>,
      })),
    };
  }

  async updateStatus(
    userId: string,
    id: string,
    status: string,
  ): Promise<InsightRecord | null> {
    const existing = await this.prisma.insight.findFirst({ where: { id, userId } });
    if (!existing) return null;
    const row = await this.prisma.insight.update({
      where: { id },
      data: { status },
      include: { evidence: true },
    });
    return this.toRecord(
      row,
      row.evidence.map((e) => ({ eventId: e.eventId, weight: e.weight ?? 1 })),
    );
  }

  private toRecord(
    row: {
      id: string;
      userId: string;
      kind: string;
      fingerprint: string;
      title: string;
      body: string;
      confidence: number | null;
      method: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
    },
    evidence: Array<{ eventId: string; weight: number }>,
  ): InsightRecord {
    return {
      id: row.id,
      userId: row.userId,
      kind: row.kind,
      fingerprint: row.fingerprint,
      title: row.title,
      body: row.body,
      confidence: row.confidence,
      method: row.method,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      evidence,
    };
  }
}
