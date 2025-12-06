import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessageEntity } from 'src/entities/gigachat/chat-message.entity';
import { ChatMessageStatus } from 'src/entities/gigachat/chat-message-status.enum';
import { UserEntity } from 'src/entities/user/user.entity';
import { AccountEntity } from 'src/entities/finance/account.entity';
import { TransactionEntity } from 'src/entities/finance/transaction.entity';
import { LLMRequestService } from '../services/llm-request.service';
import { ChatPromptService } from '../services/chat-prompt.service';

interface ChatJobData {
  messageId: string;
  userId: string;
  userMessage: string;
}

@Processor('chat')
@Injectable()
export class ChatProcessor extends WorkerHost {
  private readonly logger = new Logger(ChatProcessor.name);

  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly chatMessageRepository: Repository<ChatMessageEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly llmRequestService: LLMRequestService,
    private readonly chatPromptService: ChatPromptService,
  ) {
    super();
  }

  async process(job: Job<ChatJobData>): Promise<void> {
    const { messageId, userId, userMessage } = job.data;

    this.logger.log(`Обработка сообщения чата ${messageId} от пользователя ${userId}`);

    const message = await this.chatMessageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      this.logger.error(`Сообщение ${messageId} не найдено`);
      return;
    }

    try {
      message.status = ChatMessageStatus.PROCESSING;
      await this.chatMessageRepository.save(message);

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      const accounts = await this.accountRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      const recentTransactions = await this.transactionRepository.find({
        where: { userId },
        order: { date: 'DESC', createdAt: 'DESC' },
        take: 10,
      });

      const systemPrompt = this.chatPromptService.getSystemPrompt();
      const userPrompt = this.chatPromptService.buildUserPrompt(
        user,
        accounts,
        recentTransactions,
        userMessage,
      );

      const fullMessage = `${systemPrompt}\n\n${userPrompt}`;
      const aiResponse = await this.llmRequestService.request(fullMessage);

      message.status = ChatMessageStatus.COMPLETED;
      message.aiResponse = aiResponse;
      await this.chatMessageRepository.save(message);

      this.logger.log(`Сообщение чата ${messageId} успешно обработано`);
    } catch (error) {
      this.logger.error(
        `Ошибка обработки сообщения ${messageId}: ${error.message}`,
        error.stack,
      );

      message.status = ChatMessageStatus.FAILED;
      message.error = error.message;
      await this.chatMessageRepository.save(message);
    }
  }
}

