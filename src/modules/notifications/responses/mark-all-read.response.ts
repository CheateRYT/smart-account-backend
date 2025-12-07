import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType({ description: 'Результат отметки всех уведомлений как прочитанных' })
export class MarkAllReadResponse {
  @Field(() => Boolean, { description: 'Успешно ли выполнена операция' })
  success: boolean;

  @Field(() => Int, { description: 'Количество отмеченных уведомлений' })
  count: number;
}


