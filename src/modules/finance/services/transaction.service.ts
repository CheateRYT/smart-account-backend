import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from 'src/entities/finance/transaction.entity';
import { AccountEntity } from 'src/entities/finance/account.entity';
import { TransactionCreateInput } from '../inputs/transaction-create.input';
import { TransactionUpdateInput } from '../inputs/transaction-update.input';
import { TransactionListInput } from '../inputs/transaction-list.input';
import { PaginatedTransactionResponse } from '../responses/paginated-transaction.response';
import { TransactionStatus } from 'src/entities/finance/transaction-status.enum';
import { TransactionType } from 'src/entities/finance/transaction-type.enum';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  async create(
    userId: string,
    input: TransactionCreateInput,
  ): Promise<TransactionEntity> {
    const account = await this.accountRepository.findOne({
      where: { id: input.accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Счет не найден');
    }

    const transaction = this.transactionRepository.create({
      ...input,
      userId,
      amount: Number(input.amount),
      status: input.status || TransactionStatus.PENDING,
    });

    if (transaction.status === TransactionStatus.COMPLETED) {
      const newBalance = await this.calculateAccountBalance(
        account.id,
        transaction,
      );

      if (newBalance < 0) {
        throw new BadRequestException(
          'Недостаточно средств на счете. Баланс не может быть отрицательным.',
        );
      }
    }

    const savedTransaction = await this.transactionRepository.save(transaction);

    if (savedTransaction.status === TransactionStatus.COMPLETED) {
      await this.recalculateAccountBalance(account.id);
    }

    return this.transactionRepository.findOneOrFail({
      where: { id: savedTransaction.id },
      relations: ['account'],
    });
  }

  async findAll(userId: string): Promise<TransactionEntity[]> {
    return this.transactionRepository.find({
      where: { userId },
      relations: ['account'],
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async findAllWithFilters(
    userId: string,
    input: TransactionListInput,
  ): Promise<PaginatedTransactionResponse> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.account', 'account')
      .where('transaction.userId = :userId', { userId });

    if (input.accountId) {
      queryBuilder.andWhere('transaction.accountId = :accountId', {
        accountId: input.accountId,
      });
    }

    if (input.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: input.type });
    }

    if (input.status) {
      queryBuilder.andWhere('transaction.status = :status', {
        status: input.status,
      });
    }

    if (input.dateFrom) {
      queryBuilder.andWhere('transaction.date >= :dateFrom', {
        dateFrom: input.dateFrom,
      });
    }

    if (input.dateTo) {
      queryBuilder.andWhere('transaction.date <= :dateTo', {
        dateTo: input.dateTo,
      });
    }

    if (input.category) {
      queryBuilder.andWhere('transaction.category = :category', {
        category: input.category,
      });
    }

    if (input.minAmount != null) {
      queryBuilder.andWhere('transaction.amount >= :minAmount', {
        minAmount: input.minAmount,
      });
    }

    if (input.maxAmount != null) {
      queryBuilder.andWhere('transaction.amount <= :maxAmount', {
        maxAmount: input.maxAmount,
      });
    }

    if (input.search) {
      queryBuilder.andWhere(
        '(transaction.description ILIKE :search OR transaction.category ILIKE :search)',
        { search: `%${input.search}%` },
      );
    }

    const totalCount = await queryBuilder.getCount();

    if (input.sort) {
      try {
        const sortObject = JSON.parse(input.sort);
        Object.keys(sortObject).forEach((field) => {
          const order =
            sortObject[field].toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
          queryBuilder.addOrderBy(`transaction.${field}`, order);
        });
      } catch {
        queryBuilder.orderBy('transaction.date', 'DESC');
        queryBuilder.addOrderBy('transaction.createdAt', 'DESC');
      }
    } else {
      queryBuilder.orderBy('transaction.date', 'DESC');
      queryBuilder.addOrderBy('transaction.createdAt', 'DESC');
    }

    if (input.skip != null) {
      queryBuilder.skip(input.skip);
    }

    if (input.take != null) {
      queryBuilder.take(input.take);
    }

    const [data, queryCount] = await queryBuilder.getManyAndCount();

    return {
      data,
      queryCount,
      totalCount,
    };
  }

  async findByAccount(
    accountId: string,
    userId: string,
  ): Promise<TransactionEntity[]> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Счет не найден');
    }

    return this.transactionRepository.find({
      where: { accountId, userId },
      relations: ['account'],
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<TransactionEntity> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId },
      relations: ['account'],
    });

    if (!transaction) {
      throw new NotFoundException('Транзакция не найдена');
    }

    return transaction;
  }

  async update(
    id: string,
    userId: string,
    input: TransactionUpdateInput,
  ): Promise<TransactionEntity> {
    const transaction = await this.findOne(id, userId);
    const oldStatus = transaction.status;
    const oldAccountId = transaction.accountId;

    if (input.accountId && input.accountId !== transaction.accountId) {
      const account = await this.accountRepository.findOne({
        where: { id: input.accountId, userId },
      });

      if (!account) {
        throw new NotFoundException('Счет не найден');
      }

      transaction.accountId = input.accountId;
    }

    if (input.amount != null) {
      transaction.amount = Number(input.amount);
    }

    Object.assign(transaction, {
      ...input,
      amount: input.amount != null ? Number(input.amount) : transaction.amount,
    });

    if (transaction.status === TransactionStatus.COMPLETED) {
      const newBalance = await this.calculateAccountBalance(
        transaction.accountId,
        transaction,
        transaction.id,
      );

      if (newBalance < 0) {
        throw new BadRequestException(
          'Недостаточно средств на счете. Баланс не может быть отрицательным.',
        );
      }
    }

    const savedTransaction = await this.transactionRepository.save(transaction);

    if (
      oldStatus === TransactionStatus.COMPLETED ||
      savedTransaction.status === TransactionStatus.COMPLETED
    ) {
      if (oldStatus === TransactionStatus.COMPLETED && oldAccountId) {
        await this.recalculateAccountBalance(oldAccountId);
      }

      if (
        savedTransaction.status === TransactionStatus.COMPLETED &&
        savedTransaction.accountId
      ) {
        await this.recalculateAccountBalance(savedTransaction.accountId);
      }
    }

    return this.transactionRepository.findOneOrFail({
      where: { id: savedTransaction.id },
      relations: ['account'],
    });
  }

  async remove(id: string, userId: string): Promise<TransactionEntity> {
    const transaction = await this.findOne(id, userId);
    const accountId = transaction.accountId;
    const wasCompleted = transaction.status === TransactionStatus.COMPLETED;

    await this.transactionRepository.remove(transaction);

    if (wasCompleted && accountId) {
      await this.recalculateAccountBalance(accountId);
    }

    return transaction;
  }

  private async recalculateAccountBalance(accountId: string): Promise<void> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      return;
    }

    const transactions = await this.transactionRepository.find({
      where: {
        accountId,
        status: TransactionStatus.COMPLETED,
      },
    });

    let balance = 0;

    for (const transaction of transactions) {
      if (transaction.type === TransactionType.INCOME) {
        balance += transaction.amount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        balance -= transaction.amount;
      }
    }

    account.balance = balance;
    await this.accountRepository.save(account);
  }

  private async calculateAccountBalance(
    accountId: string,
    newTransaction: Partial<TransactionEntity>,
    excludeTransactionId?: string,
  ): Promise<number> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.accountId = :accountId', { accountId })
      .andWhere('transaction.status = :status', {
        status: TransactionStatus.COMPLETED,
      });

    if (excludeTransactionId) {
      queryBuilder.andWhere('transaction.id != :excludeId', {
        excludeId: excludeTransactionId,
      });
    }

    const transactions = await queryBuilder.getMany();

    let balance = 0;

    for (const transaction of transactions) {
      if (transaction.type === TransactionType.INCOME) {
        balance += transaction.amount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        balance -= transaction.amount;
      }
    }

    if (
      newTransaction.status === TransactionStatus.COMPLETED &&
      newTransaction.type &&
      newTransaction.amount
    ) {
      if (newTransaction.type === TransactionType.INCOME) {
        balance += newTransaction.amount;
      } else if (newTransaction.type === TransactionType.EXPENSE) {
        balance -= newTransaction.amount;
      }
    }

    return balance;
  }
}
