import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Входные данные для обновления профиля пользователя' })
export class UserUpdateInput {
  @Field(() => String, { nullable: true, description: 'Имя пользователя' })
  name?: string;

  @Field(() => String, { nullable: true, description: 'URL изображения профиля' })
  imageUrl?: string;
}



