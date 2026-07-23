import { Module } from '@nestjs/common';
import { PrivacyController } from './interface/privacy.controller';
import { ExportAccountUseCase } from './application/export-account.usecase';
import { DeleteAccountUseCase } from './application/delete-account.usecase';

/**
 * Bounded context de Privacidade / direitos do titular (docs/15, docs/20 M7).
 */
@Module({
  controllers: [PrivacyController],
  providers: [ExportAccountUseCase, DeleteAccountUseCase],
})
export class PrivacyModule {}
