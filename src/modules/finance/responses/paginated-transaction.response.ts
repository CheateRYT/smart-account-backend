import { Field, ObjectType } from '@nestjs/graphql';
import { PaginatedResponse } from 'src/common/gql/paginated-response';
import { TransactionEntity } from 'src/entities/finance/transaction.entity';

@ObjectType({ description: 'Пагинированный список транзакций' })
export class PaginatedTransactionResponse extends PaginatedResponse {
  @Field(() => [TransactionEntity], {
    description: 'Список транзакций',
  })
  data: TransactionEntity[];
}



