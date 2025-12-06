import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AnalyticsTaskEntity } from 'src/entities/finance/analytics-task.entity';
import { TransactionEntity } from 'src/entities/finance/transaction.entity';
import { AccountEntity } from 'src/entities/finance/account.entity';
import { BudgetEntity } from 'src/entities/finance/budget.entity';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsPromptService } from './services/analytics-prompt.service';
import { AnalyticsResolver } from './resolvers/analytics.resolver';
import { AnalyticsProcessor } from './processors/analytics.processor';
import { GigachatModule } from '../gigachat/gigachat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsTaskEntity,
      TransactionEntity,
      AccountEntity,
      BudgetEntity,
    ]),
    BullModule.registerQueue({
      name: 'analytics',
    }),
    GigachatModule,
  ],
  providers: [
    AnalyticsService,
    AnalyticsPromptService,
    AnalyticsResolver,
    AnalyticsProcessor,
  ],
  exports: [AnalyticsService, AnalyticsPromptService],
})
export class FinanceAnalyticsModule {}

