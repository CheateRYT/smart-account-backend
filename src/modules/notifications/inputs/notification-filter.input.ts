import { InputType, Field } from '@nestjs/graphql';
import { NotificationType } from 'src/entities/notifications/notification-type.enum';

@InputType()
export class NotificationFilterInput {
  @Field(() => NotificationType, { nullable: true, description: 'Фильтр по типу уведомления' })
  type?: NotificationType;

  @Field(() => Boolean, { nullable: true, description: 'Фильтр по статусу прочтения' })
  isRead?: boolean;
}


