import { Field, ObjectType, Int } from '@nestjs/graphql';
import { NotificationEntity } from 'src/entities/notifications/notification.entity';

@ObjectType({ description: 'Пагинированный список уведомлений' })
export class PaginatedNotificationResponse {
  @Field(() => [NotificationEntity], { description: 'Список уведомлений' })
  items: NotificationEntity[];

  @Field(() => Int, { description: 'Общее количество уведомлений' })
  total: number;

  @Field(() => Int, { description: 'Текущая страница' })
  page: number;

  @Field(() => Int, { description: 'Размер страницы' })
  pageSize: number;
}


