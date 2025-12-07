import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { NotificationType } from './notification-type.enum';

@ObjectType({ description: 'Уведомление пользователя' })
@Entity('notifications')
export class NotificationEntity {
  @Field(() => ID, { description: 'Идентификатор уведомления' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID, { description: 'Идентификатор пользователя' })
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Field(() => NotificationType, { description: 'Тип уведомления' })
  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Field(() => String, { description: 'Заголовок уведомления' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Field(() => String, { description: 'Текст уведомления' })
  @Column({ type: 'text' })
  message: string;

  @Field(() => Boolean, { description: 'Прочитано ли уведомление' })
  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Field(() => String, { nullable: true, description: 'Дополнительные данные в формате JSON' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @Field(() => Date, { description: 'Дата и время создания уведомления' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}


