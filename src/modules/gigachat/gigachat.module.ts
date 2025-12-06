import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { GigachatService } from './gigachat.service';
import { LLMRequestService } from './services/llm-request.service';
import { ChatPromptService } from './services/chat-prompt.service';
import { GigachatResolver } from './resolvers/gigachat.resolver';
import { ChatProcessor } from './processors/chat.processor';
import { ConfigModule } from '../config/config.module';
import { ChatMessageEntity } from 'src/entities/gigachat/chat-message.entity';
import { UserEntity } from 'src/entities/user/user.entity';
import { AccountEntity } from 'src/entities/finance/account.entity';
import { TransactionEntity } from 'src/entities/finance/transaction.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      ChatMessageEntity,
      UserEntity,
      AccountEntity,
      TransactionEntity,
    ]),
    BullModule.registerQueue({
      name: 'chat',
    }),
  ],
  providers: [
    GigachatService,
    LLMRequestService,
    ChatPromptService,
    GigachatResolver,
    ChatProcessor,
  ],
  exports: [GigachatService, LLMRequestService],
})
export class GigachatModule {}


