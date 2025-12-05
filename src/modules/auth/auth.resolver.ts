import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserEntity } from 'src/entities/user/user.entity';
import { Public } from 'src/decorators/auth/public.decorator';
import { CurrentUser } from 'src/decorators/auth/current-user.decorator';
import { JwtPayload } from './jwt-payload.interface';
import { LoginInput } from './inputs/login.input';
import { RegisterInput } from './inputs/register.input';
import { ConfirmEmailInput } from './inputs/confirm-email.input';

@Resolver(() => UserEntity)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => UserEntity, {
    description: 'Регистрация пользователя. Требует подтверждения email.',
  })
  register(
    @Args('input', {
      description: 'Данные для регистрации пользователя',
    })
    input: RegisterInput,
  ): Promise<UserEntity> {
    return this.authService.register(input);
  }

  @Public()
  @Mutation(() => UserEntity, {
    description: 'Авторизация пользователя. Возвращает пользователя с установленным JWT токеном.',
  })
  login(
    @Args('input', {
      description: 'Данные для авторизации пользователя',
    })
    input: LoginInput,
  ): Promise<UserEntity> {
    return this.authService.login(input);
  }

  @Public()
  @Mutation(() => UserEntity, {
    description: 'Подтверждение адреса электронной почты по токену, отправленному на email',
  })
  confirmEmail(
    @Args('input', {
      description: 'Токен подтверждения электронной почты',
    })
    input: ConfirmEmailInput,
  ): Promise<UserEntity> {
    return this.authService.confirmEmail(input);
  }

  @Query(() => UserEntity, {
    description: 'Получение информации о текущем авторизованном пользователе',
  })
  getCurrentUser(@CurrentUser() user: JwtPayload): Promise<UserEntity> {
    return this.authService.getCurrentUser(user.sub);
  }
}
