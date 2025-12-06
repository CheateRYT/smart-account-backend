import { InputType, IntersectionType } from '@nestjs/graphql';
import { TransactionFilterInput } from './transaction-filter.input';
import { SortAndPaginationInput } from 'src/common/gql/sort-and-pagination.input';

@InputType({ description: 'Входные данные для получения списка транзакций с фильтрами, сортировкой и пагинацией' })
export class TransactionListInput extends IntersectionType(
  TransactionFilterInput,
  SortAndPaginationInput,
  InputType,
) {}




