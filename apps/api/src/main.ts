import './shared/config/load-dotenv';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/http/all-exceptions.filter';
import { loadEnv } from './shared/config/env';

/**
 * Bootstrap do backend Atlas. Ver docs/09_Backend_Architecture.md e docs/16_Security.md.
 */
async function bootstrap(): Promise<void> {
  const env = loadEnv(); // falha rápido se .env estiver inválido
  const app = await NestFactory.create(AppModule, { bufferLogs: false });

  app.use(helmet());
  app.enableCors({ origin: true, credentials: true }); // MVP: refinar origins na V1 (docs/16)
  app.setGlobalPrefix('api');
  // Validação de entrada é feita com Zod (ZodValidationPipe por rota), não class-validator.
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  await app.listen(env.API_PORT, '0.0.0.0');
  Logger.log(`Atlas API rodando em http://localhost:${env.API_PORT}/api`, 'Bootstrap');
}

void bootstrap();
