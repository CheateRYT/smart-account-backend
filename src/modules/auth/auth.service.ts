import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from 'src/modules/config/config.service';
import { UserEntity } from 'src/entities/user/user.entity';
import { JwtPayload } from './jwt-payload.interface';
import { LoginInput } from './inputs/login.input';
import { RegisterInput } from './inputs/register.input';
import { ConfirmEmailInput } from './inputs/confirm-email.input';
import { EmailService } from './services/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  private generateToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.config.jwtToken.secret,
      expiresIn: this.configService.config.jwtToken.userTokenExpiresIn,
    });
  }

  private generateEmailConfirmationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async register(input: RegisterInput): Promise<UserEntity> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser && existingUser.isEmailConfirmed) {
      throw new ConflictException(
        'Пользователь с таким email уже зарегистрирован и подтверждён',
      );
    }

    const emailConfirmationToken = this.generateEmailConfirmationToken();

    if (existingUser && !existingUser.isEmailConfirmed) {
      existingUser.name = input.name?.trim() || null;
      existingUser.passwordHash = input.password;
      existingUser.emailConfirmationToken = emailConfirmationToken;
      existingUser.isEmailConfirmed = false;
      const savedUser = await this.userRepository.save(existingUser);
      const userWithRelations = await this.userRepository.findOneOrFail({
        where: { id: savedUser.id },
        relations: ['logo'],
      });

      await this.emailService.sendConfirmationEmail(
        normalizedEmail,
        userWithRelations.name || normalizedEmail,
        emailConfirmationToken,
      );

      this.logger.log(
        `Пользователь ${normalizedEmail} повторно зарегистрирован (ожидает подтверждения)`,
      );

      return userWithRelations;
    }

    const user = this.userRepository.create({
      email: normalizedEmail,
      passwordHash: input.password,
      name: input.name?.trim() || null,
      emailConfirmationToken,
      isEmailConfirmed: false,
    });

    const savedUser = await this.userRepository.save(user);
    const userWithRelations = await this.userRepository.findOneOrFail({
      where: { id: savedUser.id },
      relations: ['logo'],
    });

    await this.emailService.sendConfirmationEmail(
      normalizedEmail,
      userWithRelations.name || normalizedEmail,
      emailConfirmationToken,
    );

    this.logger.log(
      `Пользователь ${normalizedEmail} зарегистрирован (ожидает подтверждения)`,
    );

    return userWithRelations;
  }

  async login(input: LoginInput): Promise<UserEntity> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
      relations: ['logo'],
    });

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Аккаунт деактивирован');
    }

    if (!user.isEmailConfirmed) {
      throw new UnauthorizedException(
        'Электронная почта не подтверждена. Пожалуйста, подтвердите email перед входом',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const payload: JwtPayload = {
      sub: user.id,
    };

    const token = this.generateToken(payload);

    user.jwtToken = token;
    const savedUser = await this.userRepository.save(user);
    const userWithRelations = await this.userRepository.findOneOrFail({
      where: { id: savedUser.id },
      relations: ['logo'],
    });

    this.logger.log(`Пользователь ${userWithRelations.email} успешно авторизован`);

    return userWithRelations;
  }

  async confirmEmail(input: ConfirmEmailInput): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { emailConfirmationToken: input.token },
      relations: ['logo'],
    });

    if (!user) {
      throw new NotFoundException('Неверный токен подтверждения');
    }

    if (user.isEmailConfirmed) {
      throw new BadRequestException('Электронная почта уже подтверждена');
    }

    user.isEmailConfirmed = true;
    user.emailConfirmationToken = null;
    const savedUser = await this.userRepository.save(user);
    const confirmedUser = await this.userRepository.findOneOrFail({
      where: { id: savedUser.id },
      relations: ['logo'],
    });

    this.logger.log(`Электронная почта ${confirmedUser.email} подтверждена`);

    return confirmedUser;
  }

  async validateToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.config.jwtToken.secret,
      });
      return payload;
    } catch (error) {
      this.logger.warn(`Невалидный JWT токен: ${error.message}`);
      return null;
    }
  }

  async getCurrentUser(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['logo', 'accounts', 'transactions', 'budgets'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }
}
