import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Входные данные для изменения пароля' })
export class PasswordChangeInput {
  @Field(() => String, { description: 'Текущий пароль' })
  currentPassword: string;

  @Field(() => String, { description: 'Новый пароль' })
  newPassword: string;
}



