import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BudgetEntity } from 'src/entities/finance/budget.entity';
import { BudgetUpdateInput } from '../inputs/budget-update.input';
import { BudgetCreateInput } from '../inputs/budget-create.input';

@Injectable()
export class BudgetService {
  private readonly logger = new Logger(BudgetService.name);

  constructor(
    @InjectRepository(BudgetEntity)
    private readonly budgetRepository: Repository<BudgetEntity>,
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

    return this.budgetRepository.save(budget);
  }

  async remove(id: string, userId: string): Promise<BudgetEntity> {
    const budget = await this.findOne(id, userId);
    await this.budgetRepository.remove(budget);
    return budget;
  }
}

