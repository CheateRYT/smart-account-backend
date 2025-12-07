import {
  Injectable,
  NotFoundException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BudgetEntity } from 'src/entities/finance/budget.entity';
import { BudgetUpdateInput } from '../inputs/budget-update.input';
import { BudgetCreateInput } from '../inputs/budget-create.input';
import { NotificationCheckerService } from 'src/modules/notifications/services/notification-checker.service';
import { TransactionEntity } from 'src/entities/finance/transaction.entity';
import { TransactionType } from 'src/entities/finance/transaction-type.enum';
import { TransactionStatus } from 'src/entities/finance/transaction-status.enum';
import { BudgetCategory } from 'src/entities/finance/budget-category.enum';
import dayjs from 'dayjs';

@Injectable()
export class BudgetService {
  private readonly logger = new Logger(BudgetService.name);

  private readonly categoryLabelToEnumMap: Record<string, BudgetCategory> = {
    'Развлечения': BudgetCategory.ENTERTAINMENT,
    'Кино': BudgetCategory.CINEMA,
    'Рестораны': BudgetCategory.RESTAURANTS,
    'Транспорт': BudgetCategory.TRANSPORT,
    'Продукты': BudgetCategory.GROCERIES,
    'Одежда': BudgetCategory.CLOTHING,
    'Здоровье': BudgetCategory.HEALTH,
    'Образование': BudgetCategory.EDUCATION,
    'Коммунальные услуги': BudgetCategory.UTILITIES,
    'Интернет': BudgetCategory.INTERNET,
    'Мобильная связь': BudgetCategory.MOBILE,
    'Техника': BudgetCategory.TECH,
    'Подарки': BudgetCategory.GIFTS,
    'Путешествия': BudgetCategory.TRAVEL,
    'Спорт': BudgetCategory.SPORTS,
    'Книги': BudgetCategory.BOOKS,
    'Красота': BudgetCategory.BEAUTY,
    'Дом': BudgetCategory.HOME,
    'Домашние животные': BudgetCategory.PETS,
    'Другое': BudgetCategory.OTHER,
  };

  private getCategoryLabels(enumValue: BudgetCategory): string[] {
    const labels: string[] = [enumValue];
    for (const [label, enumVal] of Object.entries(this.categoryLabelToEnumMap)) {
      if (enumVal === enumValue) {
        labels.push(label);
      }
    }
    return labels;
  }

  constructor(
    @InjectRepository(BudgetEntity)
    private readonly budgetRepository: Repository<BudgetEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @Inject(forwardRef(() => NotificationCheckerService))
    private readonly notificationChecker: NotificationCheckerService,
  ) {}

  async findAll(userId: string): Promise<BudgetEntity[]> {
    return this.budgetRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<BudgetEntity> {
    const budget = await this.budgetRepository.findOne({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException('Бюджет не найден');
    }

    return budget;
  }

  async create(userId: string, input: BudgetCreateInput): Promise<BudgetEntity> {
    const budget = this.budgetRepository.create({
      ...input,
      userId,
      targetAmount: Number(input.targetAmount),
      currentAmount: Number(input.currentAmount || 0),
    });

    return this.budgetRepository.save(budget);
  }

  async update(
    id: string,
    userId: string,
    input: BudgetUpdateInput,
  ): Promise<BudgetEntity> {
    const budget = await this.findOne(id, userId);

    if (input.name != null) {
      budget.name = input.name;
    }

    if (input.category != null) {
      budget.category = input.category;
    }

    if (input.type != null) {
      budget.type = input.type;
    }

    if (input.targetAmount != null) {
      budget.targetAmount = Number(input.targetAmount);
    }

    if (input.currentAmount != null) {
      budget.currentAmount = Number(input.currentAmount);
    }

    const updated = await this.budgetRepository.save(budget);

    try {
      await this.notificationChecker.checkBudgetLimits(userId);
    } catch (error) {
      this.logger.error(
        `Ошибка при проверке уведомлений для бюджета ${budget.id}:`,
        error,
      );
    }

    return updated;
  }

  async remove(id: string, userId: string): Promise<BudgetEntity> {
    const budget = await this.findOne(id, userId);
    await this.budgetRepository.remove(budget);
    return budget;
  }

  async recalculateCurrentAmount(budgetId: string, userId: string): Promise<void> {
    const budget = await this.budgetRepository.findOne({
      where: { id: budgetId, userId },
    });

    if (!budget) {
      return;
    }

    const currentMonth = dayjs().startOf('month').toDate();
    const budgetCategory = budget.category;
    const categoryVariants = this.getCategoryLabels(budgetCategory);

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(transaction.amount), 0)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('transaction.date >= :fromDate', { fromDate: currentMonth });

    if (categoryVariants.length === 1) {
      queryBuilder.andWhere('transaction.category = :category', {
        category: categoryVariants[0],
      });
    } else {
      queryBuilder.andWhere('transaction.category IN (:...categories)', {
        categories: categoryVariants,
      });
    }

    const result = await queryBuilder.getRawOne();

    const spent = parseFloat(result?.total || '0');
    const previousAmount = budget.currentAmount;
    budget.currentAmount = spent;
    await this.budgetRepository.save(budget);

    this.logger.debug(
      `Бюджет ${budgetId} обновлен: ${previousAmount} -> ${spent} (категория бюджета: ${budgetCategory}, варианты: ${categoryVariants.join(', ')})`,
    );
  }

  async recalculateAllBudgetsForUser(userId: string): Promise<void> {
    const budgets = await this.budgetRepository.find({
      where: { userId },
    });

    for (const budget of budgets) {
      await this.recalculateCurrentAmount(budget.id, userId);
    }
  }
}

