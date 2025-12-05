import { registerEnumType } from '@nestjs/graphql';

export enum BudgetType {
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

registerEnumType(BudgetType, {
  name: 'BudgetType',
  description:
    'Тип бюджета: MONTHLY - Месячный, WEEKLY - Недельный, YEARLY - Годовой, CUSTOM - Произвольный',
});
