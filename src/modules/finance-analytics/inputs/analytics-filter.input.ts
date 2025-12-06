import { Field, InputType } from '@nestjs/graphql';
import { AnalyticsType } from 'src/entities/finance/analytics-type.enum';
import { AnalyticsStatus } from 'src/entities/finance/analytics-status.enum';

@InputType({ description: 'Фильтры для получения списка аналитики' })
export class AnalyticsFilterInput {
  @Field(() => AnalyticsType, {
    nullable: true,
    description: 'Тип аналитики',
  })
  type?: AnalyticsType;

  @Field(() => AnalyticsStatus, {
    nullable: true,
    description: 'Статус задачи',
  })
  status?: AnalyticsStatus;

  @Field(() => String, { nullable: true, description: 'Идентификатор счета' })
  accountId?: string;

  @Field(() => Date, {
    nullable: true,
    description: 'Дата начала периода',
  })
  dateFrom?: Date;

  @Field(() => Date, {
    nullable: true,
    description: 'Дата окончания периода',
  })
  dateTo?: Date;
}

