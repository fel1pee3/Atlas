import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../identity/interface/access-token.guard';
import { CurrentUser } from '../../identity/interface/current-user.decorator';
import { ExportAccountUseCase } from '../application/export-account.usecase';
import { DeleteAccountUseCase } from '../application/delete-account.usecase';
import { AccountStatsUseCase } from '../application/account-stats.usecase';

/**
 * Direitos do titular + stats North Star (docs/17 §4.8, docs/15 §7, M7/M8).
 */
@Controller('account')
@UseGuards(AccessTokenGuard)
export class PrivacyController {
  constructor(
    private readonly exportAccount: ExportAccountUseCase,
    private readonly deleteAccount: DeleteAccountUseCase,
    private readonly stats: AccountStatsUseCase,
  ) {}

  @Get('stats')
  getStats(@CurrentUser() userId: string) {
    return this.stats.execute(userId);
  }

  @Get('export')
  exportData(@CurrentUser() userId: string) {
    return this.exportAccount.execute(userId);
  }

  @Delete()
  delete(@CurrentUser() userId: string) {
    return this.deleteAccount.execute(userId);
  }
}
