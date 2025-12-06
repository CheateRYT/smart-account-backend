import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AccountEntity } from 'src/entities/finance/account.entity';
import { TransactionEntity } from 'src/entities/finance/transaction.entity';
import { TBankService } from './services/tbank.service';
import { BanksResolver } from './resolvers/banks.resolver';
import { BanksSyncScheduler } from './schedulers/banks-sync.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountEntity, TransactionEntity]),
    ScheduleModule.forRoot(),
  ],
  providers: [TBankService, BanksResolver, BanksSyncScheduler],
  exports: [TBankService],
})
export class BanksModule {}



