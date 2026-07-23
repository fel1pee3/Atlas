import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { loadEnv } from '../../../shared/config/env';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Serviço de autenticação (docs/16_Security.md).
 * - Senhas com bcrypt (M0). Meta: migrar para argon2id (ver docs/16 §JWT/hashing).
 * - Access token JWT curto + refresh token opaco com ROTAÇÃO (guardamos só o hash).
 */
@Injectable()
export class AuthService {
  private readonly env = loadEnv();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string): Promise<AuthTokens> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado.');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: { email, passwordHash },
    });
    return this.issueTokens(user.id);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Mensagem genérica para não revelar se o e-mail existe (docs/16 — enumeração).
    const invalid = new UnauthorizedException('Credenciais inválidas.');
    if (!user) {
      await bcrypt.compare(password, '$2a$12$invalidinvalidinvalidinvalidinvalidin');
      throw invalid;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw invalid;
    return this.issueTokens(user.id);
  }

  /**
   * Rotação de refresh: valida o token apresentado, revoga-o e emite um novo par.
   * Reuse detection simples: token revogado/expirado → 401 (docs/16).
   */
  async refresh(rawRefreshToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const record = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Sessão inválida ou expirada.');
    }
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });
    return this.issueTokens(record.userId);
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(userId: string): Promise<AuthTokens> {
    const accessToken = await this.jwt.signAsync(
      { sub: userId },
      { secret: this.env.JWT_ACCESS_SECRET, expiresIn: this.env.JWT_ACCESS_TTL },
    );

    const rawRefreshToken = randomBytes(48).toString('base64url');
    const expiresAt = new Date(Date.now() + this.env.JWT_REFRESH_TTL * 1000);
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash: this.hashToken(rawRefreshToken), expiresAt },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: this.env.JWT_ACCESS_TTL,
    };
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }
}
