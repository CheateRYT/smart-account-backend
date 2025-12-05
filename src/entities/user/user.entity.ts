import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AccountEntity } from '../finance/account.entity';
import { TransactionEntity } from '../finance/transaction.entity';
import { BudgetEntity } from '../finance/budget.entity';
import { ImageEntity } from '../files/image.entity';

@ObjectType({ description: 'Пользователь системы' })
@Entity('users')
export class UserEntity {
  @Field(() => ID, { description: 'Идентификатор пользователя' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { description: 'Адрес электронной почты пользователя' })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Field(() => String, { nullable: true, description: 'Имя пользователя' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true, description: 'URL изображения профиля' })
  @Column({ type: 'text', nullable: true })
  imageUrl?: string | null;

  @Field(() => Boolean, { description: 'Флаг активности пользователя' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Field(() => Boolean, { description: 'Флаг подтверждения адреса электронной почты' })
  @Column({ type: 'boolean', default: false })
  isEmailConfirmed: boolean;

  @Column({ type: 'text', nullable: true })
  emailConfirmationToken?: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'Текущий JWT токен пользователя для авторизации',
  })
  @Column({ type: 'text', nullable: true })
  jwtToken?: string | null;

  @Field(() => [AccountEntity], {
    nullable: true,
    description: 'Счета пользователя',
  })
  @OneToMany(() => AccountEntity, (account) => account.user)
  accounts?: AccountEntity[];

  @Field(() => [TransactionEntity], {
    nullable: true,
    description: 'Транзакции пользователя',
  })
  @OneToMany(() => TransactionEntity, (transaction) => transaction.user)
  transactions?: TransactionEntity[];

  @Field(() => [BudgetEntity], {
    nullable: true,
    description: 'Бюджеты пользователя',
  })
  @OneToMany(() => BudgetEntity, (budget) => budget.user)
  budgets?: BudgetEntity[];

  @Field(() => ImageEntity, {
    nullable: true,
    description: 'Аватар пользователя',
  })
  @ManyToOne(() => ImageEntity, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: false,
  })
  logo?: ImageEntity | null;

  @Field(() => Date, { description: 'Дата и время создания пользователя' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date, {
    description: 'Дата и время последнего обновления пользователя',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @BeforeInsert()
  async normalizeAndHashPassword(): Promise<void> {
    if (this.email) {
      this.email = this.email.trim().toLowerCase();
    }
    if (this.name) {
      this.name = this.name.trim();
    }
    if (this.passwordHash) {
      const saltRounds = 10;
      this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    }
  }

  @BeforeUpdate()
  async hashPasswordOnUpdate(): Promise<void> {
    if (this.passwordHash && !this.passwordHash.startsWith('$2b$')) {
      const saltRounds = 10;
      this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    }
  }
}

