import { registerEnumType } from '@nestjs/graphql';

export enum NotificationType {
  BUDGET_LIMIT_WARNING = 'BUDGET_LIMIT_WARNING',
  BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',
  LOW_SAVINGS = 'LOW_SAVINGS',
  ANOMALOUS_TRANSACTION = 'ANOMALOUS_TRANSACTION',
  RECURRING_TRANSACTION_DUE = 'RECURRING_TRANSACTION_DUE',
}

registerEnumType(NotificationType, {
  name: 'NotificationType',
  description: 'Типы уведомлений',
});


