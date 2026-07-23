import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../identity/interface/access-token.guard';
import { CurrentUser } from '../../identity/interface/current-user.decorator';
import { ExportAccountUseCase } from '../application/export-account.usecase';
import { DeleteAccountUseCase } from '../application/delete-account.usecase';

/**
 * Direitos do titular — export / delete (docs/17 §4.8, docs/15 §7, M7).
 * MVP síncrono (sem fila BullMQ).
 */
@Controller('account')
@UseGuards(AccessTokenGuard)
export class PrivacyController {
  constructor(
    private readonly exportAccount: ExportAccountUseCase,
    private readonly deleteAccount: DeleteAccountUseCase,
  ) {}

  @Get('export')
  exportData(@CurrentUser() userId: string) {
    return this.exportAccount.execute(userId);
  }

  @Delete()
  delete(@CurrentUser() userId: string) {
    return this.deleteAccount.execute(userId);
  }
}
