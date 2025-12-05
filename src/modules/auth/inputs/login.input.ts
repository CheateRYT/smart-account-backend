import { Field, InputType } from '@nestjs/graphql';

@InputType({
  description: 'Входные данные для авторизации пользователя',
})
export class LoginInput {
  @Field(() => String, {
    description: 'Адрес электронной почты пользователя',
  })
  email: string;

  @Field(() => String, {
    description: 'Пароль пользователя',
  })
  password: string;
}

