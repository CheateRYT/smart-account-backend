import { Field, InputType } from '@nestjs/graphql';
import { TransactionType } from 'src/entities/finance/transaction-type.enum';
import { TransactionStatus } from 'src/entities/finance/transaction-status.enum';

@InputType({ description: 'Фильтры для поиска транзакций' })
export class TransactionFilterInput {
  @Field(() => String, {
    nullable: true,
    description: 'Идентификатор счета',
  })
  accountId?: string;

  @Field(() => TransactionType, {
    nullable: true,
    description: 'Тип транзакции',
  })
  type?: TransactionType;

  @Field(() => TransactionStatus, {
    nullable: true,
    description: 'Статус транзакции',
  })
  status?: TransactionStatus;

  @Field(() => Date, {
    nullable: true,
    description: 'Дата начала периода',
  })
  dateFrom?: Date;

  @Field(() => Date, {
    nullable: true,
    description: 'Дата окончания периода',
  })
  dateTo?: Date;

  @Field(() => String, {
    nullable: true,
    description: 'Категория транзакции',
  })
  category?: string;

  @Field(() => Number, {
    nullable: true,
    description: 'Минимальная сумма транзакции',
  })
  minAmount?: number;

  @Field(() => Number, {
    nullable: true,
    description: 'Максимальная сумма транзакции',
  })
  maxAmount?: number;

  @Field(() => String, {
    nullable: true,
    description: 'Поиск по описанию',
  })
  search?: string;
}



