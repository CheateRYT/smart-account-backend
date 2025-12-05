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
import { ChatMessageStatus } from './chat-message-status.enum';

@ObjectType({ description: 'Сообщение чата с финансовым ботом' })
@Entity('chat_messages')
export class ChatMessageEntity {
  @Field(() => ID, { description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ChatMessageStatus, { description: 'Статус обработки сообщения' })
  @Column({ type: 'enum', enum: ChatMessageStatus, default: ChatMessageStatus.PENDING })
  status: ChatMessageStatus;

  @Field(() => String, { description: 'Сообщение пользователя' })
  @Column({ type: 'text' })
  userMessage: string;

  @Field(() => String, { nullable: true, description: 'Ответ от нейросети' })
  @Column({ type: 'text', nullable: true })
  aiResponse?: string | null;

  @Field(() => String, { nullable: true, description: 'Ошибка обработки' })
  @Column({ type: 'text', nullable: true })
  error?: string | null;

  @Field(() => ID, { description: 'Идентификатор пользователя' })
  @Column({ type: 'uuid' })
  userId: string;

  @Field(() => UserEntity, { description: 'Пользователь-отправитель' })
  @ManyToOne(() => UserEntity, {
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



