import {
  Injectable,
  NotFoundException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from 'src/entities/finance/account.entity';
import { AccountCreateInput } from '../inputs/account-create.input';
import { AccountUpdateInput } from '../inputs/account-update.input';
import { BankType } from 'src/entities/finance/bank-type.enum';
import { TBankService } from 'src/modules/banks/services/tbank.service';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @Inject(forwardRef(() => TBankService))
    private readonly tbankService: TBankService,
  ) {}

  async create(userId: string, input: AccountCreateInput): Promise<AccountEntity> {
    if (input.isDefault) {
      await this.unsetDefaultAccounts(userId);
    }

    const account = this.accountRepository.create({
      ...input,
      userId,
      balance: input.balance != null ? Number(input.balance) : 0,
    });

    const savedAccount = await this.accountRepository.save(account);

    if (
      savedAccount.bankType === BankType.TBANK &&
      savedAccount.accountNumber &&
      savedAccount.bearerToken
    ) {
      try {
        this.logger.log(
          `Запуск синхронизации для счета Т-Банка ${savedAccount.id}`,
        );
        await this.tbankService.syncAccountTransactions(savedAccount.id);
        this.logger.log(
          `Синхронизация завершена для счета ${savedAccount.id}`,
        );
      } catch (error) {
        this.logger.error(
          `Ошибка синхронизации счета ${savedAccount.id}: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    }

    return this.accountRepository.findOneOrFail({
      where: { id: savedAccount.id },
      relations: ['transactions'],
    });
  }

  async findAll(userId: string): Promise<AccountEntity[]> {
    return this.accountRepository.find({
      where: { userId },
      relations: ['transactions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<AccountEntity> {
    const account = await this.accountRepository.findOne({
      where: { id, userId },
      relations: ['transactions'],
    });

    if (!account) {
      throw new NotFoundException('Счет не найден');
    }

    return account;
  }

  async update(
    id: string,
    userId: string,
    input: AccountUpdateInput,
  ): Promise<AccountEntity> {
    const account = await this.findOne(id, userId);

    if (input.isDefault && !account.isDefault) {
      await this.unsetDefaultAccounts(userId);
    }

    Object.assign(account, input);
    return this.accountRepository.save(account);
  }

  async remove(id: string, userId: string): Promise<AccountEntity> {
    const account = await this.findOne(id, userId);
    await this.accountRepository.remove(account);
    return account;
  }

  async setDefault(id: string, userId: string): Promise<AccountEntity> {
    await this.unsetDefaultAccounts(userId);
    const account = await this.findOne(id, userId);
    account.isDefault = true;
    return this.accountRepository.save(account);
  }

  private async unsetDefaultAccounts(userId: string): Promise<void> {
    await this.accountRepository.update(
      { userId, isDefault: true },
      { isDefault: false },
    );
  }
}

