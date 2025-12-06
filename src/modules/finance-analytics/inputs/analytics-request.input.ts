import { Field, InputType } from '@nestjs/graphql';
import { AnalyticsType } from 'src/entities/finance/analytics-type.enum';

@InputType({ description: 'Входные данные для запроса финансовой аналитики' })
export class AnalyticsRequestInput {
  @Field(() => AnalyticsType, { description: 'Тип аналитики' })
  type: AnalyticsType;

  @Field(() => String, { nullable: true, description: 'Идентификатор счета (null для всех счетов)' })
  accountId?: string;

  @Field(() => Date, {
    nullable: true,
    description: 'Дата начала периода (если не указана, берется весь период)',
  })
  dateFrom?: Date;

  @Field(() => Date, {
    nullable: true,
    description: 'Дата окончания периода (если не указана, берется весь период)',
  })
  dateTo?: Date;

  @Field(() => String, { nullable: true, description: 'Комментарий пользователя для аналитики' })
  comment?: string;
}

