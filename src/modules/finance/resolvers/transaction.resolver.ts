import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TransactionEntity } from 'src/entities/finance/transaction.entity';
import { TransactionService } from '../services/transaction.service';
import { TransactionCreateInput } from '../inputs/transaction-create.input';
import { TransactionUpdateInput } from '../inputs/transaction-update.input';
import { TransactionListInput } from '../inputs/transaction-list.input';
import { PaginatedTransactionResponse } from '../responses/paginated-transaction.response';
import { CurrentUser } from 'src/decorators/auth/current-user.decorator';
import { JwtPayload } from 'src/modules/auth/jwt-payload.interface';

@Resolver(() => TransactionEntity)
export class TransactionResolver {
  constructor(private readonly transactionService: TransactionService) {}

  @Mutation(() => TransactionEntity, { description: 'Создание новой транзакции' })
  createTransaction(
    @CurrentUser() user: JwtPayload,
    @Args('input', { description: 'Данные для создания транзакции' })
    input: TransactionCreateInput,
  ): Promise<TransactionEntity> {
    return this.transactionService.create(user.sub, input);
  }

  @Query(() => [TransactionEntity], {
    description: 'Получение всех транзакций пользователя',
  })
  transactions(@CurrentUser() user: JwtPayload): Promise<TransactionEntity[]> {
    return this.transactionService.findAll(user.sub);
  }

  @Query(() => PaginatedTransactionResponse, {
    description: 'Получение транзакций с фильтрами, сортировкой и пагинацией',
  })
  transactionsList(
    @CurrentUser() user: JwtPayload,
    @Args('input', {
      nullable: true,
      description: 'Фильтры, сортировка и пагинация',
    })
    input?: TransactionListInput,
  ): Promise<PaginatedTransactionResponse> {
    return this.transactionService.findAllWithFilters(
      user.sub,
      input || {},
    );
  }

  @Query(() => [TransactionEntity], {
    description: 'Получение транзакций по счету',
  })
  transactionsByAccount(
    @CurrentUser() user: JwtPayload,
    @Args('accountId', { description: 'Идентификатор счета' }) accountId: string,
  ): Promise<TransactionEntity[]> {
    return this.transactionService.findByAccount(accountId, user.sub);
  }

  @Query(() => TransactionEntity, {
    description: 'Получение транзакции по идентификатору',
  })
  transaction(
    @CurrentUser() user: JwtPayload,
    @Args('id', { description: 'Идентификатор транзакции' }) id: string,
  ): Promise<TransactionEntity> {
    return this.transactionService.findOne(id, user.sub);
  }

  @Mutation(() => TransactionEntity, { description: 'Обновление транзакции' })
  updateTransaction(
    @CurrentUser() user: JwtPayload,
    @Args('id', { description: 'Идентификатор транзакции' }) id: string,
    @Args('input', { description: 'Данные для обновления транзакции' })
    input: TransactionUpdateInput,
  ): Promise<TransactionEntity> {
    return this.transactionService.update(id, user.sub, input);
  }

  @Mutation(() => TransactionEntity, { description: 'Удаление транзакции' })
  deleteTransaction(
    @CurrentUser() user: JwtPayload,
    @Args('id', { description: 'Идентификатор транзакции' }) id: string,
  ): Promise<TransactionEntity> {
    return this.transactionService.remove(id, user.sub);
  }
}

