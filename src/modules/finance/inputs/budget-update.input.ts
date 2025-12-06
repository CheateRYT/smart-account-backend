import { Field, InputType } from '@nestjs/graphql';
import { BudgetCategory } from 'src/entities/finance/budget-category.enum';
import { BudgetType } from 'src/entities/finance/budget-type.enum';

@InputType({ description: 'Входные данные для обновления бюджета' })
export class BudgetUpdateInput {
  @Field(() => String, { nullable: true, description: 'Название бюджета' })
  name?: string;

  @Field(() => BudgetCategory, { nullable: true, description: 'Категория бюджета' })
  category?: BudgetCategory;

  @Field(() => BudgetType, { nullable: true, description: 'Тип бюджета' })
  type?: BudgetType;

  @Field(() => Number, { nullable: true, description: 'Целевая сумма бюджета' })
  targetAmount?: number;

  @Field(() => Number, { nullable: true, description: 'Текущая потраченная сумма' })
  currentAmount?: number;
}

