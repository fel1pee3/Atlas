import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { loadEnv } from '../../shared/config/env';

/**
 * Health checks para liveness/readiness (docs/27_DevOps.md, M8).
 */
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  live() {
    const env = loadEnv();
    return {
      status: 'ok',
      uptime: process.uptime(),
      version: '0.8.0-m8',
      embeddingProvider: env.EMBEDDING_PROVIDER,
    };
  }

  @Get('ready')
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ready', db: 'up' };
  }
}
