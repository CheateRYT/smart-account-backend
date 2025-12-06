import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { TBankService } from '../services/tbank.service';
import { CurrentUser } from 'src/decorators/auth/current-user.decorator';
import { JwtPayload } from 'src/modules/auth/jwt-payload.interface';
import { SyncResult } from '../inputs/sync-result.input';

@Resolver()
export class BanksResolver {
  constructor(private readonly tbankService: TBankService) {}

  @Mutation(() => Number, {
    description: 'Синхронизация транзакций для конкретного счета Т-Банка',
  })
  async syncTBankAccount(
    @CurrentUser() user: JwtPayload,
    @Args('accountId', { description: 'Идентификатор счета' }) accountId: string,
  ): Promise<number> {
    return this.tbankService.syncAccountTransactions(accountId);
  }

  @Mutation(() => SyncResult, {
    description: 'Синхронизация всех счетов Т-Банка пользователя',
  })
  async syncAllTBankAccounts(
    @CurrentUser() user: JwtPayload,
  ): Promise<SyncResult> {
    return this.tbankService.syncAllUserAccounts(user.sub);
  }
}

