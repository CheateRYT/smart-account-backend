import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AnalyticsTaskEntity } from 'src/entities/finance/analytics-task.entity';
import { TransactionEntity } from 'src/entities/finance/transaction.entity';
import { AccountEntity } from 'src/entities/finance/account.entity';
import { AnalyticsRequestInput } from '../inputs/analytics-request.input';
import { AnalyticsFilterInput } from '../inputs/analytics-filter.input';
import { AnalyticsStatus } from 'src/entities/finance/analytics-status.enum';
import { AnalyticsType } from 'src/entities/finance/analytics-type.enum';
import { TransactionStatus } from 'src/entities/finance/transaction-status.enum';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(AnalyticsTaskEntity)
    private readonly analyticsTaskRepository: Repository<AnalyticsTaskEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectQueue('analytics')
    private readonly analyticsQueue: Queue,
  ) {}

  async createTask(
    userId: string,
    input: AnalyticsRequestInput,
  ): Promise<AnalyticsTaskEntity> {
    if (input.accountId) {
      const account = await this.accountRepository.findOne({
        where: { id: input.accountId, userId },
      });

      if (!account) {
        throw new NotFoundException('Счет не найден');
      }
    }

    const task = this.analyticsTaskRepository.create({
      ...input,
      userId,
      status: AnalyticsStatus.PENDING,
    });

    const savedTask = await this.analyticsTaskRepository.save(task);

    await this.analyticsQueue.add('process-analytics', {
      taskId: savedTask.id,
      userId,
      type: input.type,
      accountId: input.accountId,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      comment: input.comment,
    });

    this.logger.log(`Создана задача аналитики ${savedTask.id} типа ${input.type}`);

    return savedTask;
  }

  async findOne(id: string, userId: string): Promise<AnalyticsTaskEntity> {
    const task = await this.analyticsTaskRepository.findOne({
      where: { id, userId },
      relations: ['account'],
    });

    if (!task) {
      throw new NotFoundException('Задача аналитики не найдена');
    }

    return task;
  }

  async findAll(
    userId: string,
    filter?: AnalyticsFilterInput,
  ): Promise<AnalyticsTaskEntity[]> {
    const where: any = { userId };

    if (filter?.type) {
      where.type = filter.type;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.accountId) {
      where.accountId = filter.accountId;
    }

    if (filter?.dateFrom || filter?.dateTo) {
      if (filter.dateFrom && filter.dateTo) {
        where.createdAt = Between(filter.dateFrom, filter.dateTo);
      } else if (filter.dateFrom) {
        where.createdAt = MoreThanOrEqual(filter.dateFrom);
      } else if (filter.dateTo) {
        where.createdAt = LessThanOrEqual(filter.dateTo);
      }
    }

    return this.analyticsTaskRepository.find({
      where,
      relations: ['account'],
      order: { createdAt: 'DESC' },
    });
  }

  async getActiveJobs(userId: string): Promise<AnalyticsTaskEntity[]> {
    return this.analyticsTaskRepository.find({
      where: {
        userId,
        status: In([AnalyticsStatus.PENDING, AnalyticsStatus.PROCESSING]),
      },
      relations: ['account'],
      order: { createdAt: 'DESC' },
    });
  }

  async refreshTask(id: string, userId: string): Promise<AnalyticsTaskEntity> {
    const task = await this.findOne(id, userId);

    if (task.status === AnalyticsStatus.COMPLETED) {
      return task;
    }

    await this.analyticsQueue.add('process-analytics', {
      taskId: task.id,
      userId,
      type: task.type,
      accountId: task.accountId,
      dateFrom: task.dateFrom,
      dateTo: task.dateTo,
      comment: task.comment,
    });

    task.status = AnalyticsStatus.PENDING;
    return this.analyticsTaskRepository.save(task);
  }

  async getTransactionsForAnalysis(
    userId: string,
    accountId?: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<TransactionEntity[]> {
    const where: any = { userId, status: TransactionStatus.COMPLETED };

    if (accountId) {
      where.accountId = accountId;
    }

    if (dateFrom && dateTo) {
      where.date = Between(dateFrom, dateTo);
    } else if (dateFrom) {
      where.date = MoreThanOrEqual(dateFrom);
    } else if (dateTo) {
      where.date = LessThanOrEqual(dateTo);
    }

    return this.transactionRepository.find({
      where,
      relations: ['account'],
      order: { date: 'ASC' },
    });
  }

  async remove(id: string, userId: string): Promise<AnalyticsTaskEntity> {
    const task = await this.findOne(id, userId);
    await this.analyticsTaskRepository.remove(task);
    return task;
  }
}

