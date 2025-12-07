import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from 'src/entities/notifications/notification.entity';
import { NotificationType } from 'src/entities/notifications/notification-type.enum';
import { NotificationFilterInput } from '../inputs/notification-filter.input';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }): Promise<NotificationEntity> {
    const notification = this.notificationRepository.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata || null,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }

  async getUserNotifications(
    userId: string,
    filter?: NotificationFilterInput,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ items: NotificationEntity[]; total: number; page: number; pageSize: number }> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (filter?.type) {
      queryBuilder.andWhere('notification.type = :type', { type: filter.type });
    }

    if (filter?.isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead: filter.isRead });
    }

    const total = await queryBuilder.getCount();

    const items = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Уведомление не найдено');
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<{ success: boolean; count: number }> {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );

    return {
      success: true,
      count: result.affected || 0,
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }
}


