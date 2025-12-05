import { registerEnumType } from '@nestjs/graphql';

export enum AccountType {
  CURRENT = 'CURRENT',
  SAVINGS = 'SAVINGS',
  CREDIT = 'CREDIT',
  INVESTMENT = 'INVESTMENT',
  DEPOSIT = 'DEPOSIT',
  BUSINESS = 'BUSINESS',
}

registerEnumType(AccountType, {
  name: 'AccountType',
  description: 'Тип счета: CURRENT - текущий счет для повседневных операций, SAVINGS - накопительный счет, CREDIT - кредитный счет, INVESTMENT - инвестиционный счет, DEPOSIT - депозитный счет, BUSINESS - бизнес-счет',
});

