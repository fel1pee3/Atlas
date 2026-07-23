import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Injeta o userId autenticado (setado pelo AccessTokenGuard) num handler.
 * Uso: `metodo(@CurrentUser() userId: string)`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<Request & { userId?: string }>();
    return req.userId as string;
  },
);
