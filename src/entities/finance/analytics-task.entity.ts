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
import { AnalyticsType } from './analytics-type.enum';
import { AnalyticsStatus } from './analytics-status.enum';

@ObjectType({ description: 'Задача финансовой аналитики' })
@Entity('analytics_tasks')
export class AnalyticsTaskEntity {
  @Field(() => ID, { description: 'Уникальный идентификатор задачи' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => AnalyticsType, { description: 'Тип аналитики' })
  @Column({ type: 'enum', enum: AnalyticsType })
  type: AnalyticsType;

  @Field(() => AnalyticsStatus, { description: 'Статус задачи' })
  @Column({ type: 'enum', enum: AnalyticsStatus, default: AnalyticsStatus.PENDING })
  status: AnalyticsStatus;

  @Field(() => ID, { nullable: true, description: 'Идентификатор счета (null для всех счетов)' })
  @Column({ type: 'uuid', nullable: true })
  accountId?: string | null;

  @Field(() => Date, { nullable: true, description: 'Дата начала периода' })
  @Column({ type: 'timestamptz', nullable: true })
  dateFrom?: Date | null;

  @Field(() => Date, { nullable: true, description: 'Дата окончания периода' })
  @Column({ type: 'timestamptz', nullable: true })
  dateTo?: Date | null;

  @Field(() => String, { nullable: true, description: 'Комментарий пользователя' })
  @Column({ type: 'text', nullable: true })
  comment?: string | null;

  @Field(() => String, { nullable: true, description: 'Результат аналитики (JSON)' })
  @Column({ type: 'text', nullable: true })
  result?: string | null;

  @Field(() => String, { nullable: true, description: 'Ошибка при обработке' })
  @Column({ type: 'text', nullable: true })
  error?: string | null;

  @Field(() => ID, { description: 'Идентификатор пользователя' })
  @Column({ type: 'uuid' })
  userId: string;

  @Field(() => UserEntity, { description: 'Пользователь-владелец' })
  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @Field(() => AccountEntity, {
    nullable: true,
    description: 'Счет для аналитики',
  })
  @ManyToOne(() => AccountEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  account?: AccountEntity | null;

  @Field(() => Date, { description: 'Дата создания' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date, { description: 'Дата обновления' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

