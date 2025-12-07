import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { NotificationsService } from '../services/notifications.service';
import { NotificationEntity } from 'src/entities/notifications/notification.entity';
import { NotificationFilterInput } from '../inputs/notification-filter.input';
import { PaginatedNotificationResponse } from '../responses/paginated-notification.response';
import { MarkAllReadResponse } from '../responses/mark-all-read.response';
import { Int } from '@nestjs/graphql';
import { CurrentUser } from 'src/decorators/auth/current-user.decorator';
import { JwtPayload } from 'src/modules/auth/jwt-payload.interface';

@Resolver(() => NotificationEntity)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Query(() => PaginatedNotificationResponse, { description: 'Получить список уведомлений пользователя' })
  async notifications(
    @CurrentUser() user: JwtPayload,
    @Args('filter', { nullable: true, type: () => NotificationFilterInput })
    filter?: NotificationFilterInput,
    @Args('page', { nullable: true, type: () => Int, defaultValue: 1 }) page?: number,
    @Args('pageSize', { nullable: true, type: () => Int, defaultValue: 20 })
    pageSize?: number,
  ): Promise<PaginatedNotificationResponse> {
    return this.notificationsService.getUserNotifications(user.sub, filter, page, pageSize);
  }

  @Query(() => Int, { description: 'Получить количество непрочитанных уведомлений' })
  async unreadNotificationsCount(
    @CurrentUser() user: JwtPayload,
  ): Promise<number> {
    return this.notificationsService.getUnreadCount(user.sub);
  }

  @Mutation(() => NotificationEntity, { description: 'Отметить уведомление как прочитанное' })
  async markNotificationAsRead(
    @CurrentUser() user: JwtPayload,
    @Args('id', { type: () => String }) id: string,
  ): Promise<NotificationEntity> {
    return this.notificationsService.markAsRead(id, user.sub);
  }

  @Mutation(() => MarkAllReadResponse, { description: 'Отметить все уведомления как прочитанные' })
  async markAllNotificationsAsRead(
    @CurrentUser() user: JwtPayload,
  ): Promise<MarkAllReadResponse> {
    return this.notificationsService.markAllAsRead(user.sub);
  }
}


