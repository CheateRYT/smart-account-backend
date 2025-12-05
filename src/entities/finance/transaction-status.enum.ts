import { registerEnumType } from '@nestjs/graphql';

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

registerEnumType(TransactionStatus, {
  name: 'TransactionStatus',
  description: 'Статус транзакции',
});



