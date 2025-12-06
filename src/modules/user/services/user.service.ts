import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/entities/user/user.entity';
import { UserUpdateInput } from '../inputs/user-update.input';
import { PasswordChangeInput } from '../inputs/password-change.input';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['logo', 'accounts', 'budgets'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async update(id: string, input: UserUpdateInput): Promise<UserEntity> {
    const user = await this.findOne(id);

    if (input.name !== undefined) {
      user.name = input.name?.trim() || null;
    }

    if (input.imageUrl !== undefined) {
      user.imageUrl = input.imageUrl || null;
    }

    const savedUser = await this.userRepository.save(user);

    return this.userRepository.findOneOrFail({
      where: { id: savedUser.id },
      relations: ['logo', 'accounts', 'budgets'],
    });
  }

  async changePassword(
    id: string,
    input: PasswordChangeInput,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      input.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Неверный текущий пароль');
    }

    user.passwordHash = input.newPassword;

    const savedUser = await this.userRepository.save(user);

    this.logger.log(`Пароль изменен для пользователя ${id}`);

    return this.userRepository.findOneOrFail({
      where: { id: savedUser.id },
      relations: ['logo', 'accounts', 'budgets'],
    });
  }

  async remove(id: string): Promise<UserEntity> {
    const user = await this.findOne(id);

    user.isActive = false;
    user.jwtToken = null;

    const savedUser = await this.userRepository.save(user);

    this.logger.log(`Профиль пользователя ${id} деактивирован`);

    return savedUser;
  }
}




