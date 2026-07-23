import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { EventsModule } from './modules/events/events.module';
import { InsightsModule } from './modules/insights/insights.module';

/**
 * Módulo raiz — compõe os bounded contexts do monólito modular (docs/09 §4).
 * Novos módulos (ingestion, privacy, search) entram aqui por fase.
 */
@Module({
  imports: [
    PrismaModule,
    IdentityModule,
    HealthModule,
    EventsModule,
    InsightsModule,
  ],
})
export class AppModule {}
