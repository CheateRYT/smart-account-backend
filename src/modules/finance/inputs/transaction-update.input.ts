import { Field, InputType } from '@nestjs/graphql';
import { TransactionType } from 'src/entities/finance/transaction-type.enum';
import { TransactionStatus } from 'src/entities/finance/transaction-status.enum';
import { RecurringInterval } from 'src/entities/finance/recurring-interval.enum';

@InputType({ description: 'Входные данные для обновления транзакции' })
export class TransactionUpdateInput {
  @Field(() => TransactionType, { nullable: true, description: 'Тип транзакции' })
  type?: TransactionType;

  @Field(() => Number, { nullable: true, description: 'Сумма транзакции' })
  amount?: number;

  @Field(() => String, { nullable: true, description: 'Описание транзакции' })
  description?: string;

  @Field(() => Date, { nullable: true, description: 'Дата транзакции' })
  date?: Date;

  @Field(() => String, { nullable: true, description: 'Категория транзакции' })
  category?: string;

  @Field(() => String, { nullable: true, description: 'URL чека' })
  receiptUrl?: string;

  @Field(() => Boolean, { nullable: true, description: 'Является ли повторяющейся' })
  isRecurring?: boolean;

  @Field(() => RecurringInterval, {
    nullable: true,
    description: 'Интервал повторения',
  })
  recurringInterval?: RecurringInterval;

  @Field(() => TransactionStatus, {
    nullable: true,
    description: 'Статус транзакции',
  })
  status?: TransactionStatus;

  @Field(() => String, { nullable: true, description: 'Идентификатор счета' })
  accountId?: string;
}

