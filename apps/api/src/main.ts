import './shared/config/load-dotenv';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/http/all-exceptions.filter';
import { loadEnv } from './shared/config/env';
import { AtlasPinoLogger, getPino } from './shared/logging/pino-logger';

/**
 * Bootstrap do backend Atlas. Ver docs/09, docs/16, docs/27 (M8 observabilidade).
 */
async function bootstrap(): Promise<void> {
  const env = loadEnv();
  const logger = new AtlasPinoLogger();
  const app = await NestFactory.create(AppModule, { bufferLogs: true, logger });
  app.useLogger(logger);

  if (env.SENTRY_DSN) {
    getPino().warn(
      'SENTRY_DSN definida — integração Sentry SDK ainda não acoplada; use logs pino por enquanto',
    );
  }

  app.use(helmet());
  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  // Railway/Fly injetam PORT; localmente usamos API_PORT (default 3333).
  const port = Number(process.env.PORT ?? env.API_PORT);
  await app.listen(port, '0.0.0.0');
  getPino().info({ port }, 'Atlas API listening');
}

void bootstrap();
