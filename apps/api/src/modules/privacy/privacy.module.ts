import { Module } from '@nestjs/common';
import { PrivacyController } from './interface/privacy.controller';
import { ExportAccountUseCase } from './application/export-account.usecase';
import { DeleteAccountUseCase } from './application/delete-account.usecase';
import { AccountStatsUseCase } from './application/account-stats.usecase';

/**
 * Privacidade + métricas de dogfooding (docs/15, docs/20 M7/M8).
 */
@Module({
  controllers: [PrivacyController],
  providers: [ExportAccountUseCase, DeleteAccountUseCase, AccountStatsUseCase],
})
export class PrivacyModule {}
