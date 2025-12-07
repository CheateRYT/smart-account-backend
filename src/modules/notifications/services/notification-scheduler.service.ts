import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/user/user.entity';
import { NotificationCheckerService } from './notification-checker.service';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private readonly notificationChecker: NotificationCheckerService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  @Cron('*/15 * * * *')
  async checkAllUsersNotifications(): Promise<void> {
    this.logger.log('Запуск периодической проверки уведомлений для всех пользователей');

    try {
      const users = await this.userRepository.find({
        where: { isActive: true },
        select: ['id'],
      });

      this.logger.log(`Найдено ${users.length} активных пользователей для проверки`);

      for (const user of users) {
        try {
          await this.notificationChecker.checkAllConditions(user.id);
        } catch (error) {
          this.logger.error(
            `Ошибка при проверке уведомлений для пользователя ${user.id}:`,
            error,
          );
        }
      }

      this.logger.log('Периодическая проверка уведомлений завершена');
    } catch (error) {
      this.logger.error('Ошибка при выполнении периодической проверки уведомлений:', error);
    }
  }
}


