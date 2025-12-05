import { registerEnumType } from '@nestjs/graphql';

export enum BankType {
  CENTER_BANK = 'CENTER_BANK',
  INVEST = 'INVEST',
  SBERBANK = 'SBERBANK',
  ALFA_BANK = 'ALFA_BANK',
  TBANK = 'TBANK',
}

registerEnumType(BankType, {
  name: 'BankType',
  description: 'Тип банка',
});



