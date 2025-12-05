import { registerEnumType } from '@nestjs/graphql';

export enum RecurringInterval {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

registerEnumType(RecurringInterval, {
  name: 'RecurringInterval',
  description: 'Интервал повторения транзакции',
});



