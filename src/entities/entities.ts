import { FileEntity } from './files/file.entity';
import { ImageEntity } from './files/image.entity';
import { UserEntity } from './user/user.entity';
import { AccountEntity } from './finance/account.entity';
import { TransactionEntity } from './finance/transaction.entity';
import { BudgetEntity } from './finance/budget.entity';
import { AnalyticsTaskEntity } from './finance/analytics-task.entity';
import { ChatMessageEntity } from './gigachat/chat-message.entity';

const Entities = [
  FileEntity,
  ImageEntity,
  UserEntity,
  AccountEntity,
  TransactionEntity,
  BudgetEntity,
  AnalyticsTaskEntity,
  ChatMessageEntity,
];

export default Entities;
