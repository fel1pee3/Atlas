import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { loadEnv } from '../../../shared/config/env';

/**
 * Guard de access token. Lê o Bearer token, verifica a assinatura e anexa
 * `userId` à request. Toda rota protegida usa este guard (docs/16_Security.md).
 */
@Injectable()
export class AccessTokenGuard implements CanActivate {
  private readonly env = loadEnv();

  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { userId?: string }>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de acesso ausente.');
    }
    const token = header.slice('Bearer '.length);
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token, {
        secret: this.env.JWT_ACCESS_SECRET,
      });
      req.userId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Token de acesso inválido ou expirado.');
    }
  }
}
