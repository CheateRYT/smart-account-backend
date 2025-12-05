import { Field, InputType } from '@nestjs/graphql';

@InputType({
  description: 'Входные данные для регистрации пользователя',
})
export class RegisterInput {
  @Field(() => String, {
    nullable: true,
    description: 'Имя пользователя',
  })
  name?: string | null;

  @Field(() => String, {
    description: 'Адрес электронной почты пользователя',
  })
  email: string;

  @Field(() => String, {
    description: 'Пароль пользователя',
  })
  password: string;
}

