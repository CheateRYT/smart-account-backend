import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/entities/notifications/notification.entity';
import { BudgetEntity } from 'src/entities/finance/budget.entity';
import { TransactionEntity } from 'src/entities/finance/transaction.entity';
import { AccountEntity } from 'src/entities/finance/account.entity';
import { UserEntity } from 'src/entities/user/user.entity';
import { NotificationsService } from './services/notifications.service';
import { NotificationCheckerService } from './services/notification-checker.service';
import { NotificationSchedulerService } from './services/notification-scheduler.service';
import { NotificationsResolver } from './resolvers/notifications.resolver';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      BudgetEntity,
      TransactionEntity,
      AccountEntity,
      UserEntity,
    ]),
    forwardRef(() => FinanceModule),
  ],
  providers: [
    NotificationsService,
    NotificationCheckerService,
    NotificationSchedulerService,
    NotificationsResolver,
  ],
  exports: [NotificationsService, NotificationCheckerService],
})
export class NotificationsModule {}


