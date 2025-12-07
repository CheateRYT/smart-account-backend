import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsTaskEntity } from 'src/entities/finance/analytics-task.entity';
import { AccountEntity } from 'src/entities/finance/account.entity';
import { BudgetEntity } from 'src/entities/finance/budget.entity';
import { AnalyticsStatus } from 'src/entities/finance/analytics-status.enum';
import { AnalyticsType } from 'src/entities/finance/analytics-type.enum';
import { AnalyticsService } from '../services/analytics.service';
import { AnalyticsPromptService } from '../services/analytics-prompt.service';
import { GigachatService } from 'src/modules/gigachat/gigachat.service';

interface AnalyticsJobData {
  taskId: string;
  userId: string;
  type: AnalyticsType;
  accountId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  comment?: string;
}

@Processor('analytics')
@Injectable()
export class AnalyticsProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  constructor(
    @InjectRepository(AnalyticsTaskEntity)
    private readonly analyticsTaskRepository: Repository<AnalyticsTaskEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(BudgetEntity)
    private readonly budgetRepository: Repository<BudgetEntity>,
    private readonly analyticsService: AnalyticsService,
    private readonly analyticsPromptService: AnalyticsPromptService,
    private readonly gigachatService: GigachatService,
  ) {
    super();
  }

  async process(job: Job<AnalyticsJobData>): Promise<void> {
    const { taskId, userId, type, accountId, dateFrom: dateFromRaw, dateTo: dateToRaw, comment } = job.data;

    const dateFrom = dateFromRaw ? (dateFromRaw instanceof Date ? dateFromRaw : new Date(dateFromRaw)) : undefined;
    const dateTo = dateToRaw ? (dateToRaw instanceof Date ? dateToRaw : new Date(dateToRaw)) : undefined;

    this.logger.log(`Обработка задачи аналитики ${taskId} типа ${type}`);

    const task = await this.analyticsTaskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      this.logger.error(`Задача ${taskId} не найдена`);
      return;
    }

    try {
      task.status = AnalyticsStatus.PROCESSING;
      await this.analyticsTaskRepository.save(task);

      const transactions = await this.analyticsService.getTransactionsForAnalysis(
        userId,
        accountId,
        dateFrom,
        dateTo,
      );

      if (transactions.length === 0) {
        task.status = AnalyticsStatus.COMPLETED;
        task.result = JSON.stringify({
          message: 'Нет транзакций за указанный период',
          transactionsCount: 0,
        });
        await this.analyticsTaskRepository.save(task);
        return;
      }

      const systemPrompt = this.analyticsPromptService.getSystemPrompt(type);
      
      const account = accountId
        ? await this.accountRepository.findOne({
            where: { id: accountId },
          })
        : null;

      const budget = await this.budgetRepository.findOne({
        where: { userId },
      });

      const userPrompt = this.analyticsPromptService.buildUserPrompt(
        transactions.map((t) => ({
          type: t.type,
          amount: Number(t.amount),
          category: t.category,
          description: t.description,
          date: t.date.toISOString(),
        })),
        account?.name,
        dateFrom,
        dateTo,
        comment,
        account?.bankType || undefined,
        budget?.targetAmount,
      );

      const analysisResult = await this.gigachatService.request(
        userPrompt,
        systemPrompt,
      );

      let parsedResult;
      try {
        parsedResult = JSON.parse(analysisResult);
      } catch {
        parsedResult = { raw: analysisResult };
      }

      task.status = AnalyticsStatus.COMPLETED;
      task.result = JSON.stringify(parsedResult);
      await this.analyticsTaskRepository.save(task);

      this.logger.log(`Задача аналитики ${taskId} успешно завершена`);
    } catch (error) {
      this.logger.error(`Ошибка обработки задачи ${taskId}: ${error.message}`, error.stack);
      
      task.status = AnalyticsStatus.FAILED;
      const errorMessage = error.message || 'Неизвестная ошибка';
      task.error = errorMessage.includes('timeout') 
        ? 'Превышено время ожидания ответа от AI. Попробуйте создать анализ снова.'
        : errorMessage;
      await this.analyticsTaskRepository.save(task);
    }
  }
}

