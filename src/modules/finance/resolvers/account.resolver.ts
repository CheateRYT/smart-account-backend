import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AccountEntity } from 'src/entities/finance/account.entity';
import { AccountService } from '../services/account.service';
import { AccountCreateInput } from '../inputs/account-create.input';
import { AccountUpdateInput } from '../inputs/account-update.input';
import { CurrentUser } from 'src/decorators/auth/current-user.decorator';
import { JwtPayload } from 'src/modules/auth/jwt-payload.interface';

@Resolver(() => AccountEntity)
export class AccountResolver {
  constructor(private readonly accountService: AccountService) {}

  @Mutation(() => AccountEntity, { description: 'Создание нового счета' })
  createAccount(
    @CurrentUser() user: JwtPayload,
    @Args('input', { description: 'Данные для создания счета' })
    input: AccountCreateInput,
  ): Promise<AccountEntity> {
    return this.accountService.create(user.sub, input);
  }

  @Query(() => [AccountEntity], { description: 'Получение всех счетов пользователя' })
  accounts(@CurrentUser() user: JwtPayload): Promise<AccountEntity[]> {
    return this.accountService.findAll(user.sub);
  }

  @Query(() => AccountEntity, { description: 'Получение счета по идентификатору' })
  account(
    @CurrentUser() user: JwtPayload,
    @Args('id', { description: 'Идентификатор счета' }) id: string,
  ): Promise<AccountEntity> {
    return this.accountService.findOne(id, user.sub);
  }

  @Mutation(() => AccountEntity, { description: 'Обновление счета' })
  updateAccount(
    @CurrentUser() user: JwtPayload,
    @Args('id', { description: 'Идентификатор счета' }) id: string,
    @Args('input', { description: 'Данные для обновления счета' })
    input: AccountUpdateInput,
  ): Promise<AccountEntity> {
    return this.accountService.update(id, user.sub, input);
  }

  @Mutation(() => AccountEntity, { description: 'Удаление счета' })
  deleteAccount(
    @CurrentUser() user: JwtPayload,
    @Args('id', { description: 'Идентификатор счета' }) id: string,
  ): Promise<AccountEntity> {
    return this.accountService.remove(id, user.sub);
  }

  @Mutation(() => AccountEntity, { description: 'Установка счета по умолчанию' })
  setDefaultAccount(
    @CurrentUser() user: JwtPayload,
    @Args('id', { description: 'Идентификатор счета' }) id: string,
  ): Promise<AccountEntity> {
    return this.accountService.setDefault(id, user.sub);
  }
}



