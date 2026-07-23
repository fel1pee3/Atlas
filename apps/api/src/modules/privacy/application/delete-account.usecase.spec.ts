import { DeleteAccountUseCase } from './delete-account.usecase';

describe('DeleteAccountUseCase', () => {
  it('apaga o usuário quando existe', async () => {
    const deleteFn = jest.fn().mockResolvedValue({});
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'u1' }),
        delete: deleteFn,
      },
    };
    const uc = new DeleteAccountUseCase(prisma as never);
    const res = await uc.execute('u1');
    expect(deleteFn).toHaveBeenCalledWith({ where: { id: 'u1' } });
    expect(res.userId).toBe('u1');
    expect(res.deletedAt).toBeTruthy();
  });

  it('falha se a conta não existe', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        delete: jest.fn(),
      },
    };
    const uc = new DeleteAccountUseCase(prisma as never);
    await expect(uc.execute('missing')).rejects.toThrow(/não encontrada/);
  });
});
