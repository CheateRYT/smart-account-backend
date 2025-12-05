import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from 'src/modules/config/config.service';
import { JwtPayload } from './jwt-payload.interface';
import { UserEntity } from 'src/entities/user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.config.jwtToken.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.sub) {
      throw new UnauthorizedException('Невалидный токен: отсутствуют обязательные поля');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['logo'],
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Аккаунт деактивирован');
    }

    if (!user.isEmailConfirmed) {
      throw new UnauthorizedException(
        'Электронная почта не подтверждена. Пожалуйста, подтвердите email',
      );
    }

    if (!user.jwtToken) {
      throw new UnauthorizedException('Сессия истекла. Пожалуйста, войдите снова');
    }

    return payload;
  }
}
