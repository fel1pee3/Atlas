import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './shared/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { EventsModule } from './modules/events/events.module';
import { InsightsModule } from './modules/insights/insights.module';
import { SearchModule } from './modules/search/search.module';
import { PrivacyModule } from './modules/privacy/privacy.module';
import { RequestIdMiddleware } from './shared/http/request-id.middleware';
import { HttpLoggingMiddleware } from './shared/http/http-logging.middleware';

/**
 * Módulo raiz — compõe os bounded contexts do monólito modular (docs/09 §4).
 * M8: request-id, HTTP logs, rate limit leve.
 */
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 120,
      },
    ]),
    PrismaModule,
    IdentityModule,
    HealthModule,
    EventsModule,
    InsightsModule,
    SearchModule,
    PrivacyModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware, HttpLoggingMiddleware).forRoutes('*');
  }
}
