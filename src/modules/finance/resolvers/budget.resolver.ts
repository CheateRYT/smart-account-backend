import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BudgetEntity } from 'src/entities/finance/budget.entity';
import { BudgetService } from '../services/budget.service';
import { BudgetUpdateInput } from '../inputs/budget-update.input';
import { BudgetCreateInput } from '../inputs/budget-create.input';
import { CurrentUser } from 'src/decorators/auth/current-user.decorator';
import { JwtPayload } from 'src/modules/auth/jwt-payload.interface';

@Resolver(() => BudgetEntity)
export class BudgetResolver {
  constructor(private readonly budgetService: BudgetService) {}

  @Query(() => [BudgetEntity], { description: 'Получение всех бюджетов пользователя' })
  budgets(@CurrentUser() user: JwtPayload): Promise<BudgetEntity[]> {
    return this.budgetService.findAll(user.sub);
  }

  @Query(() => BudgetEntity, { description: 'Получение бюджета по идентификатору' })
  budget(
    @CurrentUser() user: JwtPayload,
    @Args('id', { description: 'Идентификатор бюджета' }) id: string,
  ): Promise<BudgetEntity> {
    return this.budgetService.findOne(id, user.sub);
  }

  @Mutation(() => BudgetEntity, { description: 'Создание нового бюджета' })
  createBudget(
    @CurrentUser() user: JwtPayload,
    @Args('input', { description: 'Данные для создания бюджета' })
    input: BudgetCreateInput,
  ): Promise<BudgetEntity> {
    return this.budgetService.create(user.sub, input);
  }

  @Mutation(() => BudgetEntity, { description: 'Обновление бюджета' })
  updateBudget(
    @CurrentUser() user: JwtPayload,
    @Args('id', { description: 'Идентификатор бюджета' }) id: string,
    @Args('input', { description: 'Данные для обновления бюджета' })
    input: BudgetUpdateInput,
  ): Promise<BudgetEntity> {
    return this.budgetService.update(id, user.sub, input);
  }

  @Mutation(() => BudgetEntity, { description: 'Удаление бюджета' })
  deleteBudget(
    @CurrentUser() user: JwtPayload,
    @Args('id', { description: 'Идентификатор бюджета' }) id: string,
  ): Promise<BudgetEntity> {
    return this.budgetService.remove(id, user.sub);
  }
}

