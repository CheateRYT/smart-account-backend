import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { AccountEntity } from './account.entity';
import { TransactionType } from './transaction-type.enum';
import { TransactionStatus } from './transaction-status.enum';
import { RecurringInterval } from './recurring-interval.enum';

@ObjectType({ description: 'Транзакция пользователя' })
@Entity('transactions')
export class TransactionEntity {
  @Field(() => ID, { description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => TransactionType, { description: 'Тип транзакции' })
  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Field(() => Number, { description: 'Сумма транзакции' })
  @Column({ type: 'float' })
  amount: number;

  @Field(() => String, { nullable: true, description: 'Описание транзакции' })
  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Field(() => Date, { description: 'Дата транзакции' })
  @Column({ type: 'timestamptz' })
  date: Date;

  @Field(() => String, { description: 'Категория транзакции' })
  @Column({ type: 'varchar', length: 255 })
  category: string;

  @Field(() => String, { nullable: true, description: 'URL чека' })
  @Column({ type: 'text', nullable: true })
  receiptUrl?: string | null;

  @Field(() => Boolean, { description: 'Является ли повторяющейся' })
  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Field(() => RecurringInterval, {
    nullable: true,
    description: 'Интервал повторения',
  })
  @Column({ type: 'enum', enum: RecurringInterval, nullable: true })
  recurringInterval?: RecurringInterval | null;

  @Field(() => Date, {
    nullable: true,
    description: 'Следующая дата повторения',
  })
  @Column({ type: 'timestamptz', nullable: true })
  nextRecurringDate?: Date | null;

  @Field(() => Date, {
    nullable: true,
    description: 'Последняя обработка повторяющейся транзакции',
  })
  @Column({ type: 'timestamptz', nullable: true })
  lastProcessed?: Date | null;

  @Field(() => TransactionStatus, { description: 'Статус транзакции' })
  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Field(() => ID, { description: 'Идентификатор пользователя' })
  @Column({ type: 'uuid' })
  userId: string;

  @Field(() => ID, { description: 'Идентификатор счета' })
  @Column({ type: 'uuid' })
  accountId: string;

  @Field(() => UserEntity, { description: 'Пользователь-владелец' })
  @ManyToOne(() => UserEntity, (user) => user.transactions, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @Field(() => AccountEntity, { description: 'Счет транзакции' })
  @ManyToOne(() => AccountEntity, (account) => account.transactions, {
    onDelete: 'CASCADE',
  })
  account: AccountEntity;

  @Field(() => Date, { description: 'Дата создания' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date, { description: 'Дата обновления' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

