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
import { BudgetCategory } from './budget-category.enum';
import { BudgetType } from './budget-type.enum';

@ObjectType({ description: 'Бюджет пользователя' })
@Entity('budgets')
export class BudgetEntity {
  @Field(() => ID, { description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { description: 'Название бюджета' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Field(() => BudgetCategory, { description: 'Категория бюджета' })
  @Column({ type: 'enum', enum: BudgetCategory })
  category: BudgetCategory;

  @Field(() => BudgetType, { description: 'Тип бюджета' })
  @Column({ type: 'enum', enum: BudgetType })
  type: BudgetType;

  @Field(() => Number, { description: 'Целевая сумма бюджета' })
  @Column({ type: 'float', default: 0 })
  targetAmount: number;

  @Field(() => Number, { description: 'Текущая потраченная сумма' })
  @Column({ type: 'float', default: 0 })
  currentAmount: number;

  @Field(() => Date, {
    nullable: true,
    description: 'Дата последнего отправленного уведомления',
  })
  @Column({ type: 'timestamptz', nullable: true })
  lastAlertSent?: Date | null;

  @Field(() => ID, { description: 'Идентификатор пользователя' })
  @Column({ type: 'uuid' })
  userId: string;

  @Field(() => UserEntity, { description: 'Пользователь-владелец' })
  @ManyToOne(() => UserEntity, (user) => user.budgets, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @Field(() => Date, { description: 'Дата создания' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date, { description: 'Дата обновления' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
