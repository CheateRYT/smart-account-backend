import { registerEnumType } from '@nestjs/graphql';

export enum ChatMessageStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

registerEnumType(ChatMessageStatus, {
  name: 'ChatMessageStatus',
  description: 'Статус сообщения чата',
});



