import { Field, InputType } from '@nestjs/graphql';
import { AccountType } from 'src/entities/finance/account-type.enum';
import { BankType } from 'src/entities/finance/bank-type.enum';

@InputType({ description: 'Входные данные для обновления счета' })
export class AccountUpdateInput {
  @Field(() => String, { nullable: true, description: 'Название счета' })
  name?: string;

  @Field(() => AccountType, { nullable: true, description: 'Тип счета' })
  type?: AccountType;

  @Field(() => Boolean, { nullable: true, description: 'Является ли счетом по умолчанию' })
  isDefault?: boolean;

  @Field(() => BankType, { nullable: true, description: 'Тип банка' })
  bankType?: BankType;

  @Field(() => String, { nullable: true, description: 'Номер счета в банке' })
  accountNumber?: string;

  @Field(() => String, { nullable: true, description: 'Bearer токен для доступа к API банка' })
  bearerToken?: string;
}

