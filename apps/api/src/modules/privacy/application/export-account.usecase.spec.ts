import { ExportAccountUseCase } from './export-account.usecase';

describe('ExportAccountUseCase', () => {
  const userId = 'u-export-1';
  const createdAt = new Date('2026-01-15T12:00:00.000Z');

  it('exporta conta com eventos, insights e índice de embeddings', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: userId,
          email: 'a@b.com',
          createdAt,
        }),
      },
      event: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'e1',
            type: 'manual.mood',
            source: 'manual',
            externalId: null,
            occurredAt: createdAt,
            ingestedAt: createdAt,
            payload: { score: 4 },
          },
        ]),
      },
      insight: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'i1',
            kind: 'sleep.avg',
            fingerprint: 'fp',
            title: 't',
            body: 'b',
            confidence: 0.8,
            method: 'heuristic',
            status: 'active',
            createdAt,
            evidence: [{ eventId: 'e1', weight: 1 }],
          },
        ]),
      },
      embedding: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'emb1',
            ownerType: 'event',
            ownerId: 'e1',
            contentHash: 'h',
            model: 'gemini',
            createdAt,
          },
        ]),
      },
    };

    const uc = new ExportAccountUseCase(prisma as never);
    const res = await uc.execute(userId);

    expect(res.format).toBe('atlas.cmhl.export.v1');
    expect(res.user.email).toBe('a@b.com');
    expect(res.counts).toEqual({ events: 1, insights: 1, embeddings: 1 });
    expect(res.events[0].occurredAt).toBe(createdAt.toISOString());
    expect(res.insights[0].evidence).toHaveLength(1);
  });

  it('falha se a conta não existe', async () => {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(null) },
      event: { findMany: jest.fn() },
      insight: { findMany: jest.fn() },
      embedding: { findMany: jest.fn() },
    };
    const uc = new ExportAccountUseCase(prisma as never);
    await expect(uc.execute('missing')).rejects.toThrow(/não encontrada/);
  });
});
