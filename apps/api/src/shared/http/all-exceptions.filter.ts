import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';
import { getPino } from '../logging/pino-logger';
import type { RequestWithId } from './request-id.middleware';

/**
 * Traduz TODA exceção para RFC 7807 (application/problem+json) + traceId (M8).
 * Ver docs/17_API_Design.md.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly log = getPino().child({ component: 'exceptions' });

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<RequestWithId>();
    const traceId = req?.requestId;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Erro interno';
    let detail = 'Ocorreu um erro inesperado.';
    let errors: unknown;

    if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      title = 'Requisição inválida';
      detail = 'Um ou mais campos são inválidos.';
      errors = exception.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      title = exception.name;
      detail = typeof body === 'string' ? body : ((body as { message?: string }).message ?? title);
      if (Array.isArray((body as { message?: unknown }).message)) {
        detail = ((body as { message: string[] }).message).join('; ');
      }
      if (typeof body === 'object') errors = (body as { errors?: unknown }).errors;
    } else if (exception instanceof Error) {
      detail = exception.message;
    }

    if (status >= 500) {
      this.log.error(
        {
          traceId,
          err: exception instanceof Error ? exception.message : String(exception),
          stack: exception instanceof Error ? exception.stack : undefined,
          path: req?.url,
        },
        'unhandled',
      );
    } else if (status >= 400) {
      this.log.warn({ traceId, status, detail, path: req?.url }, 'client_error');
    }

    res
      .status(status)
      .type('application/problem+json')
      .json({
        type: 'about:blank',
        title,
        status,
        detail,
        instance: req?.url,
        ...(traceId ? { traceId } : {}),
        ...(errors ? { errors } : {}),
      });
  }
}
