import { registerEnumType } from '@nestjs/graphql';

export enum AnalyticsStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

registerEnumType(AnalyticsStatus, {
  name: 'AnalyticsStatus',
  description: 'Статус задачи аналитики',
});



