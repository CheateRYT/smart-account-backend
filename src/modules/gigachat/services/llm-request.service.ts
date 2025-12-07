import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GigaChat } from 'langchain-gigachat';
import { HumanMessage } from '@langchain/core/messages';
import { Agent } from 'node:https';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class LLMRequestService implements OnModuleInit {
  private readonly logger = new Logger(LLMRequestService.name);

  private gigaChatModel: GigaChat;

  private readonly httpsAgent: Agent;

  constructor(private readonly configService: ConfigService) {
    this.httpsAgent = new Agent({
      rejectUnauthorized: false,
    });
  }

  async onModuleInit(): Promise<void> {
    const config = this.configService.config.gigachat;
    this.gigaChatModel = new GigaChat({
      credentials: config.authKey,
      model: config.model,
      httpsAgent: this.httpsAgent,
      timeout: 120000,
    });
    this.logger.log(`GigaChat инициализирован с моделью: ${config.model}, timeout: 120s`);
  }

  async request(message: string): Promise<string> {
    return this.executeRequest(message);
  }

  private async executeRequest(message: string): Promise<string> {
    try {
      const langchainMessage = new HumanMessage(message);
      const response = await this.gigaChatModel.invoke([langchainMessage]);

      return (response.content as string).trim();
    } catch (error) {
      this.logger.error('Ошибка при выполнении запроса в LLM:', error);
      throw error;
    }
  }
}
