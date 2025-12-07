import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import dayjs from 'dayjs';
import { NotificationsService } from './notifications.service';
import { NotificationType } from 'src/entities/notifications/notification-type.enum';
import { BudgetEntity } from 'src/entities/finance/budget.entity';
import { TransactionEntity } from 'src/entities/finance/transaction.entity';
import { AccountEntity } from 'src/entities/finance/account.entity';
import { TransactionType } from 'src/entities/finance/transaction-type.enum';
import { TransactionStatus } from 'src/entities/finance/transaction-status.enum';

@Injectable()
export class NotificationCheckerService {
  private readonly logger = new Logger(NotificationCheckerService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    @InjectRepository(BudgetEntity)
    private readonly budgetRepository: Repository<BudgetEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  async checkAllConditions(userId: string): Promise<void> {
    await Promise.all([
      this.checkBudgetLimits(userId),
      this.checkFinancialCushion(userId),
    ]);
  }

  async checkBudgetLimits(userId: string): Promise<void> {
    try {
      const budgets = await this.budgetRepository.find({
        where: { userId },
      });

      const currentMonth = dayjs().startOf('month').toDate();

      for (const budget of budgets) {
        try {
          const spent = await this.getSpentByCategory(
            userId,
            budget.category,
            currentMonth,
          );

          const percentage = budget.targetAmount > 0 
            ? (spent / budget.targetAmount) * 100 
            : 0;

          if (percentage >= 80 && percentage < 100) {
            const existingNotification = await this.notificationsService.getUserNotifications(
              userId,
              {
                type: NotificationType.BUDGET_LIMIT_WARNING,
                isRead: false,
              },
              1,
              1,
            );

            const hasRecentNotification = existingNotification.items.some(
              (n) =>
                n.metadata?.budgetId === budget.id &&
                new Date(n.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000,
            );

            if (!hasRecentNotification) {
              await this.notificationsService.create({
                userId,
                type: NotificationType.BUDGET_LIMIT_WARNING,
                title: `Приближение к лимиту: ${budget.name}`,
                message: `Вы потратили ${percentage.toFixed(0)}% от бюджета "${budget.name}". Осталось ${(budget.targetAmount - spent).toFixed(2)} руб.`,
                metadata: {
                  budgetId: budget.id,
                  category: budget.category,
                  spent,
                  limit: budget.targetAmount,
                  percentage: percentage.toFixed(2),
                },
              });
            }
          }

          if (percentage >= 100) {
            const existingNotification = await this.notificationsService.getUserNotifications(
              userId,
              {
                type: NotificationType.BUDGET_EXCEEDED,
                isRead: false,
              },
              1,
              1,
            );

            const hasRecentNotification = existingNotification.items.some(
              (n) =>
                n.metadata?.budgetId === budget.id &&
                new Date(n.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000,
            );

            if (!hasRecentNotification) {
              await this.notificationsService.create({
                userId,
                type: NotificationType.BUDGET_EXCEEDED,
                title: `Превышен лимит: ${budget.name}`,
                message: `Бюджет "${budget.name}" превышен на ${(spent - budget.targetAmount).toFixed(2)} руб.`,
                metadata: {
                  budgetId: budget.id,
                  category: budget.category,
                  spent,
                  limit: budget.targetAmount,
                  exceeded: (spent - budget.targetAmount).toFixed(2),
                },
              });
            }
          }
        } catch (error) {
          this.logger.error(
            `Ошибка при проверке лимита бюджета ${budget.id}:`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Ошибка при проверке лимитов бюджета для пользователя ${userId}:`,
        error,
      );
    }
  }

  async checkFinancialCushion(userId: string): Promise<void> {
    try {
      const accounts = await this.accountRepository.find({
        where: { userId },
      });

      const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

      const avgMonthlyExpense = await this.getAvgMonthlyExpense(userId);
      const threshold = Math.max(avgMonthlyExpense * 3, 50000);

      if (totalBalance < threshold) {
        const existingNotification = await this.notificationsService.getUserNotifications(
          userId,
          {
            type: NotificationType.LOW_SAVINGS,
            isRead: false,
          },
          1,
          1,
        );

        const hasRecentNotification = existingNotification.items.some(
          (n) => new Date(n.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
        );

        if (!hasRecentNotification) {
          await this.notificationsService.create({
            userId,
            type: NotificationType.LOW_SAVINGS,
            title: 'Низкая финансовая подушка',
            message: `Ваша финансовая подушка составляет ${totalBalance.toFixed(2)} руб., что ниже рекомендуемого минимума ${threshold.toFixed(2)} руб.`,
            metadata: {
              totalBalance,
              threshold,
              accountsCount: accounts.length,
            },
          });
        }
      }
    } catch (error) {
      this.logger.error(
        `Ошибка при проверке финансовой подушки для пользователя ${userId}:`,
        error,
      );
    }
  }

  async checkAnomalousTransactions(
    userId: string,
    transaction: TransactionEntity,
  ): Promise<void> {
    try {
      if (transaction.type !== TransactionType.EXPENSE) {
        return;
      }

      if (transaction.status !== TransactionStatus.COMPLETED) {
        return;
      }

      const checks = await Promise.all([
        this.checkLargeAmount(userId, transaction),
        this.checkUnusualTime(transaction),
        this.checkNewCategory(userId, transaction),
      ]);

      if (checks.some((check) => check)) {
        this.logger.log(
          `Обнаружена аномальная транзакция ${transaction.id} для пользователя ${userId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Ошибка при проверке аномальных транзакций для пользователя ${userId}:`,
        error,
      );
    }
  }

  private async checkLargeAmount(
    userId: string,
    transaction: TransactionEntity,
  ): Promise<boolean> {
    if (!transaction.category) {
      return false;
    }

    const avgAmount = await this.getAvgAmountByCategory(
      userId,
      transaction.category,
    );

    if (avgAmount > 0 && transaction.amount > avgAmount * 3) {
      await this.notificationsService.create({
        userId,
        type: NotificationType.ANOMALOUS_TRANSACTION,
        title: 'Необычно крупная транзакция',
        message: `Обнаружена транзакция на сумму ${transaction.amount.toFixed(2)} руб. в категории "${transaction.category}", что значительно превышает ваши обычные расходы (среднее: ${avgAmount.toFixed(2)} руб.).`,
        metadata: {
          transactionId: transaction.id,
          amount: transaction.amount,
          category: transaction.category,
          avgAmount,
        },
      });
      return true;
    }

    return false;
  }

  private async checkUnusualTime(transaction: TransactionEntity): Promise<boolean> {
    const transactionDate = new Date(transaction.date);
    const hour = transactionDate.getHours();

    if (hour >= 0 && hour < 6) {
      await this.notificationsService.create({
        userId: transaction.userId,
        type: NotificationType.ANOMALOUS_TRANSACTION,
        title: 'Транзакция в необычное время',
        message: `Обнаружена транзакция на сумму ${transaction.amount.toFixed(2)} руб. в ${hour}:00, что нехарактерно для ваших обычных расходов.`,
        metadata: {
          transactionId: transaction.id,
          amount: transaction.amount,
          time: hour,
          date: transaction.date,
        },
      });
      return true;
    }

    return false;
  }

  private async checkNewCategory(
    userId: string,
    transaction: TransactionEntity,
  ): Promise<boolean> {
    if (!transaction.category) {
      return false;
    }

    const threeMonthsAgo = dayjs().subtract(3, 'month').toDate();
    const hasRecentTransactions = await this.transactionRepository.exists({
      where: {
        userId,
        category: transaction.category,
        type: TransactionType.EXPENSE,
        status: TransactionStatus.COMPLETED,
        date: MoreThanOrEqual(threeMonthsAgo),
      },
    });

    if (!hasRecentTransactions) {
      await this.notificationsService.create({
        userId,
        type: NotificationType.ANOMALOUS_TRANSACTION,
        title: 'Новая категория расходов',
        message: `Обнаружена транзакция в категории "${transaction.category}", в которой вы не тратили более 3 месяцев.`,
        metadata: {
          transactionId: transaction.id,
          category: transaction.category,
          amount: transaction.amount,
        },
      });
      return true;
    }

    return false;
  }

  private async getSpentByCategory(
    userId: string,
    category: string,
    fromDate: Date,
  ): Promise<number> {
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(transaction.amount), 0)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.category = :category', { category })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('transaction.date >= :fromDate', { fromDate })
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  private async getAvgMonthlyExpense(userId: string): Promise<number> {
    const sixMonthsAgo = dayjs().subtract(6, 'month').toDate();
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COALESCE(AVG(transaction.amount), 0)', 'avg')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('transaction.date >= :fromDate', { fromDate: sixMonthsAgo })
      .getRawOne();

    const avgTransaction = parseFloat(result?.avg || '0');

    const totalExpenses = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(transaction.amount), 0)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('transaction.date >= :fromDate', { fromDate: sixMonthsAgo })
      .getRawOne();

    const total = parseFloat(totalExpenses?.total || '0');
    const monthsCount = 6;

    return total / monthsCount;
  }

  private async getAvgAmountByCategory(
    userId: string,
    category: string,
  ): Promise<number> {
    const threeMonthsAgo = dayjs().subtract(3, 'month').toDate();
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COALESCE(AVG(transaction.amount), 0)', 'avg')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.category = :category', { category })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('transaction.date >= :fromDate', { fromDate: threeMonthsAgo })
      .getRawOne();

    return parseFloat(result?.avg || '0');
  }
}


