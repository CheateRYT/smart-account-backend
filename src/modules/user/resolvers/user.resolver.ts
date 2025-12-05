import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserEntity } from 'src/entities/user/user.entity';
import { UserService } from '../services/user.service';
import { UserUpdateInput } from '../inputs/user-update.input';
import { PasswordChangeInput } from '../inputs/password-change.input';
import { CurrentUser } from 'src/decorators/auth/current-user.decorator';
import { JwtPayload } from 'src/modules/auth/jwt-payload.interface';

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserEntity, { description: 'Получение текущего пользователя' })
  me(@CurrentUser() user: JwtPayload): Promise<UserEntity> {
    return this.userService.findOne(user.sub);
  }

  @Mutation(() => UserEntity, { description: 'Обновление профиля пользователя' })
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Args('input', { description: 'Данные для обновления профиля' })
    input: UserUpdateInput,
  ): Promise<UserEntity> {
    return this.userService.update(user.sub, input);
  }

  @Mutation(() => UserEntity, { description: 'Изменение пароля' })
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Args('input', { description: 'Данные для изменения пароля' })
    input: PasswordChangeInput,
  ): Promise<UserEntity> {
    return this.userService.changePassword(user.sub, input);
  }

  @Mutation(() => UserEntity, { description: 'Удаление профиля пользователя' })
  deleteProfile(@CurrentUser() user: JwtPayload): Promise<UserEntity> {
    return this.userService.remove(user.sub);
  }
}



