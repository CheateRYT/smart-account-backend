import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Входные данные для создания сообщения чата' })
export class ChatMessageCreateInput {
  @Field(() => String, { description: 'Сообщение пользователя' })
  message: string;
}




