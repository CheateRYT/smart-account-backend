import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import axios, { AxiosInstance } from 'axios';
import { AccountEntity } from 'src/entities/finance/account.entity';
import { TransactionEntity } from 'src/entities/finance/transaction.entity';
import { TransactionType } from 'src/entities/finance/transaction-type.enum';
import { TransactionStatus } from 'src/entities/finance/transaction-status.enum';
import { BankType } from 'src/entities/finance/bank-type.enum';

interface TBankOperation {
  operationDate: string;
  operationId?: string;
  operationStatus?: string;
  accountNumber?: string;
  typeOfOperation?: string;
  operationAmount?: number;
  accountAmount?: number;
  description?: string;
  payPurpose?: string;
  category?: string;
  documentNumber?: string;
  payer?: {
    name?: string;
    acct?: string;
  };
  receiver?: {
    name?: string;
    acct?: string;
  };
  valueDate?: string;
  trxnPostDate?: string;
  authorizationDate?: string;
  drawDate?: string;
  chargeDate?: string;
  docDate?: string;
}

interface TBankBalances {
  balanceBegin: number;
  balanceEnd: number;
  credit: number;
  debit: number;
  creditAuthorizations?: number;
  debitAuthorizations?: number;
  operationsCount?: number;
  balances?: Array<{
    date: string;
    balanceBegin: number;
    balanceEnd: number;
    credit: number;
    debit: number;
  }>;
}

interface TBankStatementResponse {
  balances?: TBankBalances;
  operations?: TBankOperation[];
  nextCursor?: string;
}

interface TBankAccountInfo {
  accountNumber: string;
  balance: number;
  currency: string;
}

@Injectable()
export class TBankService {
  private readonly logger = new Logger(TBankService.name);

  private readonly baseUrl = 'https://business.tbank.ru/openapi/sandbox/api/v1';

  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  private createAxiosClient(bearerToken: string): AxiosInstance {
    return axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getAccountInfo(
    accountNumber: string,
    bearerToken: string,
  ): Promise<TBankAccountInfo> {
    try {
      const client = this.createAxiosClient(bearerToken);
      const dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const response = await client.get<TBankStatementResponse>('/statement', {
        params: {
          accountNumber,
          from: dateFrom.toISOString(),
        },
      });

      const balance = response.data.balances?.balanceEnd || 0;

      return {
        accountNumber,
        balance,
        currency: 'RUB',
      };
    } catch (error) {
      this.logger.error(
        `Ошибка получения информации о счете Т-Банка: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Не удалось получить информацию о счете');
    }
  }

  async getTransactions(
    accountNumber: string,
    bearerToken: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<TBankOperation[]> {
    try {
      const client = this.createAxiosClient(bearerToken);
      const params: Record<string, string> = {
        accountNumber,
      };

      if (dateFrom) {
        params.from = dateFrom.toISOString();
      }
      if (dateTo) {
        params.to = dateTo.toISOString();
      }

      const response = await client.get<TBankStatementResponse>('/statement', {
        params,
      });

      return response.data.operations || [];
    } catch (error) {
      this.logger.error(
        `Ошибка получения транзакций Т-Банка: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Не удалось получить транзакции');
    }
  }

  private determineTransactionType(
    operation: TBankOperation,
  ): 'INCOME' | 'EXPENSE' {
    if (operation.typeOfOperation) {
      const type = operation.typeOfOperation.toLowerCase();
      if (type === 'credit' || type.includes('credit')) {
        return 'INCOME';
      }
      if (type === 'debit' || type.includes('debit')) {
        return 'EXPENSE';
      }
    }

    const amount = operation.operationAmount || operation.accountAmount || 0;
    return amount >= 0 ? 'INCOME' : 'EXPENSE';
  }

  private extractCategory(operation: TBankOperation): string {
    if (operation.category) {
      const categoryMap: Record<string, string> = {
        fee: 'Комиссия',
        payment: 'Платеж',
        transfer: 'Перевод',
        salary: 'Зарплата',
        purchase: 'Покупка',
      };
      return (
        categoryMap[operation.category.toLowerCase()] || operation.category
      );
    }

    const description = (
      operation.description ||
      operation.payPurpose ||
      ''
    ).toLowerCase();
    if (description.includes('зарплата') || description.includes('salary'))
      return 'Зарплата';
    if (description.includes('перевод') || description.includes('transfer'))
      return 'Перевод';
    if (description.includes('покупка') || description.includes('purchase'))
      return 'Покупка';
    if (description.includes('комиссия') || description.includes('fee'))
      return 'Комиссия';
    if (description.includes('платеж') || description.includes('payment'))
      return 'Платеж';

    return 'Прочее';
  }

  async syncAccountTransactions(accountId: string): Promise<number> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new BadRequestException('Счет не найден');
    }

    if (account.bankType !== BankType.TBANK) {
      throw new BadRequestException('Счет не принадлежит Т-Банку');
    }

    if (!account.accountNumber || !account.bearerToken) {
      throw new BadRequestException(
        'Отсутствуют данные для синхронизации (accountNumber или bearerToken)',
      );
    }

    const lastTransaction = await this.transactionRepository.findOne({
      where: { accountId: account.id },
      order: { date: 'DESC' },
    });

    const dateFrom = lastTransaction
      ? new Date(lastTransaction.date)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const tbankTransactions = await this.getTransactions(
      account.accountNumber,
      account.bearerToken,
      dateFrom,
      new Date(),
    );

    let syncedCount = 0;

    for (const operation of tbankTransactions) {
      const txDate = new Date(
        operation.operationDate ||
          operation.drawDate ||
          operation.chargeDate ||
          operation.docDate ||
          operation.valueDate ||
          new Date(),
      );
      const txAmount = Math.abs(
        operation.operationAmount || operation.accountAmount || 0,
      );
      const txType = this.determineTransactionType(operation);
      const txDescription =
        operation.description ||
        operation.payPurpose ||
        `${operation.payer?.name || ''} -> ${operation.receiver?.name || ''}`.trim() ||
        'Транзакция Т-Банка';

      if (txAmount === 0) {
        continue;
      }

      const existingTransaction = await this.transactionRepository.findOne({
        where: {
          accountId: account.id,
          date: txDate,
          amount: txAmount,
          type:
            txType === 'INCOME'
              ? TransactionType.INCOME
              : TransactionType.EXPENSE,
        },
      });

      if (existingTransaction) {
        continue;
      }

      const transaction = this.transactionRepository.create({
        type:
          txType === 'INCOME'
            ? TransactionType.INCOME
            : TransactionType.EXPENSE,
        amount: txAmount,
        description: txDescription,
        date: txDate,
        category: this.extractCategory(operation),
        status: TransactionStatus.COMPLETED,
        accountId: account.id,
        userId: account.userId,
        isRecurring: false,
      });

      await this.transactionRepository.save(transaction);
      syncedCount++;
    }

    await this.recalculateAccountBalance(account.id);

    this.logger.log(
      `Синхронизировано ${syncedCount} транзакций для счета ${accountId}`,
    );

    return syncedCount;
  }

  async syncAllUserAccounts(userId: string): Promise<{
    accountsSynced: number;
    totalTransactions: number;
  }> {
    const accounts = await this.accountRepository.find({
      where: {
        userId,
        bankType: BankType.TBANK,
        accountNumber: Not(IsNull()),
        bearerToken: Not(IsNull()),
      },
    });

    let totalTransactions = 0;
    let accountsSynced = 0;

    for (const account of accounts) {
      try {
        const count = await this.syncAccountTransactions(account.id);
        totalTransactions += count;
        accountsSynced++;
      } catch (error) {
        this.logger.error(
          `Ошибка синхронизации счета ${account.id}: ${error.message}`,
        );
      }
    }

    return {
      accountsSynced,
      totalTransactions,
    };
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
}
