import { LoggerService } from '@nestjs/common';
import pino, { type Logger as PinoLogger } from 'pino';
import { loadEnv } from '../config/env';

let root: PinoLogger | null = null;

export function getPino(): PinoLogger {
  if (!root) {
    const env = loadEnv();
    root = pino({
      level: env.LOG_LEVEL,
      base: { service: 'atlas-api', env: env.NODE_ENV },
      redact: {
        paths: [
          'req.headers.authorization',
          'password',
          'refreshToken',
          'accessToken',
          'GEMINI_API_KEY',
        ],
        remove: true,
      },
    });
  }
  return root;
}

/** Adapter Nest ← pino (docs/27 — observabilidade mínima M8). */
export class AtlasPinoLogger implements LoggerService {
  private readonly pino = getPino();

  log(message: unknown, ...optional: unknown[]): void {
    const context = optional[0];
    this.pino.info({ context }, String(message));
  }

  error(message: unknown, ...optional: unknown[]): void {
    const [trace, context] = optional;
    this.pino.error({ err: message, trace, context }, String(message));
  }

  warn(message: unknown, ...optional: unknown[]): void {
    const context = optional[0];
    this.pino.warn({ context }, String(message));
  }

  debug(message: unknown, ...optional: unknown[]): void {
    const context = optional[0];
    this.pino.debug({ context }, String(message));
  }

  verbose(message: unknown, ...optional: unknown[]): void {
    const context = optional[0];
    this.pino.trace({ context }, String(message));
  }
}
