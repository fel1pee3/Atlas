import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';

/**
 * Deleção real da conta (docs/15 §7.4, docs/20 M7 / gate D5).
 * Hard delete via cascade Prisma: events, RMs, insights, embeddings, refresh tokens.
 * Não apaga embedding_cache global (hashes compartilháveis sem PII do usuário).
 */
@Injectable()
export class DeleteAccountUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<{ deletedAt: string; userId: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Conta não encontrada');

    await this.prisma.user.delete({ where: { id: userId } });

    return {
      deletedAt: new Date().toISOString(),
      userId,
    };
  }
}
