import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/entities/user/user.entity';
import { AccountEntity } from 'src/entities/finance/account.entity';
import { TransactionEntity } from 'src/entities/finance/transaction.entity';

@Injectable()
export class ChatPromptService {
  getSystemPrompt(): string {
    return `Ты финансовый бот-аналитик. Твоя задача - помогать пользователям анализировать их финансовое состояние, давать советы по управлению бюджетом и отвечать на вопросы о транзакциях и счетах.

Будь дружелюбным, профессиональным и точным в своих ответах. Используй предоставленную информацию о пользователе, его счетах и транзакциях для формирования персональных рекомендаций.

Отвечай на русском языке, будь конкретным и полезным.`;
  }

  buildUserPrompt(
    user: UserEntity,
    accounts: AccountEntity[],
    recentTransactions: TransactionEntity[],
    userMessage: string,
  ): string {
    const userName = user.name || user.email.split('@')[0];
    const accountsInfo = this.formatAccountsInfo(accounts);
    const transactionsInfo = this.formatTransactionsInfo(recentTransactions);

    return `Информация о пользователе:
Имя: ${userName}
Email: ${user.email}

Счета пользователя:
${accountsInfo}

Последние транзакции (последние 10):
${transactionsInfo}

Вопрос пользователя: ${userMessage}

Ответь на вопрос пользователя, используя предоставленную информацию о его финансовом состоянии.`;
  }

  private formatAccountsInfo(accounts: AccountEntity[]): string {
    if (accounts.length === 0) {
      return 'У пользователя нет счетов';
    }

    return accounts
      .map(
        (account) =>
          `- ${account.name}: баланс ${account.balance.toFixed(2)} руб. (тип: ${account.type})`,
      )
      .join('\n');
  }

  private formatTransactionsInfo(transactions: TransactionEntity[]): string {
    if (transactions.length === 0) {
      return 'Нет транзакций';
    }

    return transactions
      .slice(0, 10)
      .map(
        (tx) =>
          `- ${tx.type === 'INCOME' ? 'Поступление' : 'Расход'}: ${tx.amount.toFixed(2)} руб., категория: ${tx.category}, описание: ${tx.description || 'нет'}, дата: ${tx.date.toISOString().split('T')[0]}`,
      )
      .join('\n');
  }
}



