import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';

/**
 * Traduz TODA exceção para o formato RFC 7807 (application/problem+json).
 * Ver docs/17_API_Design.md (erros padronizados). Mantém o contrato de erro
 * consistente entre a API e o cliente mobile.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<{ url?: string }>();

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
      if (typeof body === 'object') errors = (body as { errors?: unknown }).errors;
    } else if (exception instanceof Error) {
      detail = exception.message;
    }

    if (status >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
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
        ...(errors ? { errors } : {}),
      });
  }
}
