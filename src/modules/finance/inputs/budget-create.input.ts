import { Field, InputType } from '@nestjs/graphql';
import { BudgetCategory } from 'src/entities/finance/budget-category.enum';
import { BudgetType } from 'src/entities/finance/budget-type.enum';

@InputType({ description: 'Входные данные для создания бюджета' })
export class BudgetCreateInput {
  @Field(() => String, { description: 'Название бюджета' })
  name: string;

  @Field(() => BudgetCategory, { description: 'Категория бюджета' })
  category: BudgetCategory;

  @Field(() => BudgetType, { description: 'Тип бюджета' })
  type: BudgetType;

  @Field(() => Number, { description: 'Целевая сумма бюджета' })
  targetAmount: number;

  @Field(() => Number, {
    nullable: true,
    description: 'Текущая потраченная сумма',
    defaultValue: 0,
  })
  currentAmount?: number;
}



