import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import { getPino } from '../logging/pino-logger';
import type { RequestWithId } from './request-id.middleware';

/**
 * Log HTTP estruturado (método, path, status, duração, requestId) — M8.
 * Não loga body (PII / payloads de eventos).
 */
@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  private readonly log = getPino().child({ component: 'http' });

  use(req: RequestWithId, res: Response, next: NextFunction): void {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      const payload = {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl?.split('?')[0] ?? req.url,
        status: res.statusCode,
        ms,
      };
      if (res.statusCode >= 500) this.log.error(payload, 'request');
      else if (res.statusCode >= 400) this.log.warn(payload, 'request');
      else this.log.info(payload, 'request');
    });
    next();
  }
}
