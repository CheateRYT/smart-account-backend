import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ChatMessageEntity } from 'src/entities/gigachat/chat-message.entity';
import { GigachatService } from '../gigachat.service';
import { ChatMessageCreateInput } from '../inputs/chat-message-create.input';
import { CurrentUser } from 'src/decorators/auth/current-user.decorator';
import { JwtPayload } from 'src/modules/auth/jwt-payload.interface';

@Resolver(() => ChatMessageEntity)
export class GigachatResolver {
  constructor(private readonly gigachatService: GigachatService) {}

  @Mutation(() => ChatMessageEntity, {
    description: 'Отправка сообщения в финансовый чат-бот',
  })
  sendMessage(
    @CurrentUser() user: JwtPayload,
    @Args('input', { description: 'Данные сообщения' })
    input: ChatMessageCreateInput,
  ): Promise<ChatMessageEntity> {
    return this.gigachatService.sendMessage(user.sub, input.message);
  }

  @Query(() => ChatMessageEntity, {
    description: 'Получение статуса сообщения',
  })
  getMessageStatus(
    @CurrentUser() user: JwtPayload,
    @Args('messageId', { description: 'Идентификатор сообщения' })
    messageId: string,
  ): Promise<ChatMessageEntity> {
    return this.gigachatService.getMessageStatus(messageId, user.sub);
  }
}




