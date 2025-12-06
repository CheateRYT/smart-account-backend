import { registerEnumType } from '@nestjs/graphql';

export enum AnalyticsType {
  SPENDING_PATTERNS = 'SPENDING_PATTERNS',
  INCOME_ANALYSIS = 'INCOME_ANALYSIS',
  BUDGET_COMPLIANCE = 'BUDGET_COMPLIANCE',
  CATEGORY_BREAKDOWN = 'CATEGORY_BREAKDOWN',
  TREND_ANALYSIS = 'TREND_ANALYSIS',
}

registerEnumType(AnalyticsType, {
  name: 'AnalyticsType',
  description: 'Тип финансовой аналитики',
});




