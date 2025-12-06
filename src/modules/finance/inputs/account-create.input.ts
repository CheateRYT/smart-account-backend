import { Field, InputType } from '@nestjs/graphql';
import { AccountType } from 'src/entities/finance/account-type.enum';
import { BankType } from 'src/entities/finance/bank-type.enum';

@InputType({ description: 'Входные данные для создания счета' })
export class AccountCreateInput {
  @Field(() => String, { description: 'Название счета' })
  name: string;

  @Field(() => AccountType, { description: 'Тип счета' })
  type: AccountType;

  @Field(() => Number, {
    nullable: true,
    description: 'Начальный баланс счета',
  })
  balance?: number;

  @Field(() => Boolean, { nullable: true, description: 'Является ли счетом по умолчанию' })
  isDefault?: boolean;

  @Field(() => BankType, { nullable: true, description: 'Тип банка' })
  bankType?: BankType;

  @Field(() => String, { nullable: true, description: 'Номер счета в банке' })
  accountNumber?: string;

  @Field(() => String, { nullable: true, description: 'Bearer токен для доступа к API банка' })
  bearerToken?: string;
}

