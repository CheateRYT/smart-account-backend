import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { AccountEntity } from 'src/entities/finance/account.entity';
import { BankType } from 'src/entities/finance/bank-type.enum';
import { TBankService } from '../services/tbank.service';

@Injectable()
export class BanksSyncScheduler {
  private readonly logger = new Logger(BanksSyncScheduler.name);

  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    private readonly tbankService: TBankService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async syncAllBanksAccounts() {
    this.logger.log('Запуск автоматической синхронизации счетов банков');

    const accounts = await this.accountRepository.find({
      where: {
        bankType: BankType.TBANK,
        accountNumber: Not(IsNull()),
        bearerToken: Not(IsNull()),
      },
    });

    this.logger.log(`Найдено ${accounts.length} счетов для синхронизации`);

    for (const account of accounts) {
      try {
        await this.tbankService.syncAccountTransactions(account.id);
      } catch (error) {
        this.logger.error(
          `Ошибка синхронизации счета ${account.id}: ${error.message}`,
        );
      }
    }

    this.logger.log('Автоматическая синхронизация завершена');
  }
}

