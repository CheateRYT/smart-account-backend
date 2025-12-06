import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Результат синхронизации счетов' })
export class SyncResult {
  @Field(() => Number, { description: 'Количество синхронизированных счетов' })
  accountsSynced: number;

  @Field(() => Number, { description: 'Общее количество синхронизированных транзакций' })
  totalTransactions: number;
}




