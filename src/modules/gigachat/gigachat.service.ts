import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LLMRequestService } from './services/llm-request.service';
import { ChatMessageEntity } from 'src/entities/gigachat/chat-message.entity';
import { ChatMessageStatus } from 'src/entities/gigachat/chat-message-status.enum';

@Injectable()
export class GigachatService {
  private readonly logger = new Logger(GigachatService.name);

  constructor(
    private readonly llmRequestService: LLMRequestService,
    @InjectQueue('chat')
    private readonly chatQueue: Queue,
    @InjectRepository(ChatMessageEntity)
    private readonly chatMessageRepository: Repository<ChatMessageEntity>,
  ) {}

  async request(prompt: string, systemPrompt?: string): Promise<string> {
    let fullMessage = prompt;
    if (systemPrompt) {
      fullMessage = `${systemPrompt}\n\n${prompt}`;
    }
    return this.llmRequestService.request(fullMessage);
  }

  async sendMessage(
    userId: string,
    userMessage: string,
  ): Promise<ChatMessageEntity> {
    const message = this.chatMessageRepository.create({
      userId,
      userMessage,
      status: ChatMessageStatus.PENDING,
    });

    const savedMessage = await this.chatMessageRepository.save(message);

    await this.chatQueue.add('process-message', {
      messageId: savedMessage.id,
      userId,
      userMessage,
    });

    this.logger.log(`Сообщение ${savedMessage.id} добавлено в очередь`);

    return savedMessage;
  }

  async getMessageStatus(
    messageId: string,
    userId: string,
  ): Promise<ChatMessageEntity> {
    const message = await this.chatMessageRepository.findOne({
      where: { id: messageId, userId },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    return message;
  }
}
