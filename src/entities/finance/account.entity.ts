import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { TransactionEntity } from './transaction.entity';
import { AccountType } from './account-type.enum';
import { BankType } from './bank-type.enum';

@ObjectType({ description: 'Счет пользователя' })
@Entity('accounts')
export class AccountEntity {
  @Field(() => ID, { description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { description: 'Название счета' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Field(() => AccountType, { description: 'Тип счета' })
  @Column({ type: 'enum', enum: AccountType })
  type: AccountType;

  @Field(() => Number, { description: 'Баланс счета' })
  @Column({ type: 'float', default: 0 })
  balance: number;

  @Field(() => Boolean, { description: 'Является ли счетом по умолчанию' })
  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Field(() => BankType, { nullable: true, description: 'Тип банка' })
  @Column({ type: 'enum', enum: BankType, nullable: true })
  bankType?: BankType | null;

  @Field(() => String, { nullable: true, description: 'Номер счета в банке' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  accountNumber?: string | null;

  @Column({ type: 'text', nullable: true })
  bearerToken?: string | null;

  @Field(() => ID, { description: 'Идентификатор пользователя' })
  @Column({ type: 'uuid' })
  userId: string;

  @Field(() => UserEntity, { description: 'Пользователь-владелец' })
  @ManyToOne(() => UserEntity, (user) => user.accounts, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @Field(() => [TransactionEntity], {
    nullable: true,
    description: 'Транзакции по счету',
  })
  @OneToMany(() => TransactionEntity, (transaction) => transaction.account)
  transactions?: TransactionEntity[];

  @Field(() => Date, { description: 'Дата создания' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date, { description: 'Дата обновления' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
