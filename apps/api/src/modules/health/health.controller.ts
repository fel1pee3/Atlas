import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

/**
 * Health checks para liveness/readiness (docs/27_DevOps.md).
 * GET /health       → o processo está vivo.
 * GET /health/ready → dependências (Postgres) respondem.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  live() {
    return { status: 'ok', uptime: process.uptime() };
  }

  @Get('ready')
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ready', db: 'up' };
  }
}
