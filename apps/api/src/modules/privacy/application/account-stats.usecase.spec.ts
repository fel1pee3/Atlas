import { AccountStatsUseCase } from './account-stats.usecase';

describe('AccountStatsUseCase', () => {
  it('marca northStarMet quando há útil na semana', async () => {
    const prisma = {
      insight: {
        count: jest
          .fn()
          .mockResolvedValueOnce(2) // usefulThisWeek
          .mockResolvedValueOnce(5)
          .mockResolvedValueOnce(3)
          .mockResolvedValueOnce(1),
      },
      event: { count: jest.fn().mockResolvedValue(40) },
    };
    const uc = new AccountStatsUseCase(prisma as never);
    const stats = await uc.execute('u1');
    expect(stats.usefulThisWeek).toBe(2);
    expect(stats.northStarMet).toBe(true);
    expect(stats.eventsTotal).toBe(40);
  });
});
