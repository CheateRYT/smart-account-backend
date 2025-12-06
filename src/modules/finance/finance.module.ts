import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from 'src/entities/finance/account.entity';
import { TransactionEntity } from 'src/entities/finance/transaction.entity';
import { BudgetEntity } from 'src/entities/finance/budget.entity';
import { AccountService } from './services/account.service';
import { TransactionService } from './services/transaction.service';
import { BudgetService } from './services/budget.service';
import { AccountResolver } from './resolvers/account.resolver';
import { TransactionResolver } from './resolvers/transaction.resolver';
import { BudgetResolver } from './resolvers/budget.resolver';
import { BanksModule } from '../banks/banks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountEntity, TransactionEntity, BudgetEntity]),
    BanksModule,
  ],
  providers: [
    AccountService,
    TransactionService,
    BudgetService,
    AccountResolver,
    TransactionResolver,
    BudgetResolver,
  ],
  exports: [AccountService, TransactionService, BudgetService],
})
export class FinanceModule {}

