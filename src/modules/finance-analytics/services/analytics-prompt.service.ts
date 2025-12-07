import { Injectable } from '@nestjs/common';
import { AnalyticsType } from 'src/entities/finance/analytics-type.enum';

@Injectable()
export class AnalyticsPromptService {
  getSystemPrompt(type: AnalyticsType): string {
    const prompts: Record<AnalyticsType, string> = {
      [AnalyticsType.SPENDING_PATTERNS]: `Ты финансовый аналитик. Проанализируй паттерны расходов пользователя.
Найди закономерности: в какие дни недели тратится больше, какие категории преобладают, есть ли сезонность.
Предоставь детальный анализ с конкретными цифрами и рекомендациями по оптимизации расходов.
Ответ должен быть структурированным JSON с разделами: patterns, insights, recommendations.`,

      [AnalyticsType.INCOME_ANALYSIS]: `Ты финансовый аналитик. Проанализируй доходы пользователя.
Определи источники дохода, их стабильность, динамику роста или падения.
Выяви периоды наибольших и наименьших поступлений.
Предоставь анализ с выводами и рекомендациями по увеличению доходов.
Ответ должен быть структурированным JSON с разделами: sources, trends, insights, recommendations.`,

      [AnalyticsType.BUDGET_COMPLIANCE]: `Ты финансовый аналитик. Проанализируй соблюдение бюджета пользователем.
Сравни фактические расходы с установленным бюджетом.
Определи категории, где превышен бюджет, и где есть резерв.
Предоставь анализ с конкретными цифрами и рекомендациями по улучшению контроля бюджета.
Ответ должен быть структурированным JSON с разделами: compliance, overBudget, underBudget, recommendations.`,

      [AnalyticsType.CATEGORY_BREAKDOWN]: `Ты финансовый аналитик. Проанализируй распределение расходов по категориям.
Определи топ категорий по сумме расходов, процентное соотношение, динамику изменений.
Выяви категории с необычно высокими расходами.
Предоставь детальный анализ с визуализацией данных и рекомендациями.
Ответ должен быть структурированным JSON с разделами: categories, percentages, trends, insights, recommendations.`,

      [AnalyticsType.TREND_ANALYSIS]: `Ты финансовый аналитик. Проанализируй тренды финансов пользователя.
Определи общие тенденции: рост или падение доходов/расходов, изменение баланса.
Выяви сезонные закономерности и аномалии.
Спрогнозируй возможные изменения на основе текущих данных.
Ответ должен быть структурированным JSON с разделами: trends, seasonality, anomalies, forecast, recommendations.`,
    };

    return prompts[type];
  }

  buildUserPrompt(
    transactions: any[],
    accountName?: string,
    dateFrom?: Date | string,
    dateTo?: Date | string,
    comment?: string,
    bankType?: string,
    budgetAmount?: number,
  ): string {
    const dateFromObj = dateFrom ? (dateFrom instanceof Date ? dateFrom : new Date(dateFrom)) : undefined;
    const dateToObj = dateTo ? (dateTo instanceof Date ? dateTo : new Date(dateTo)) : undefined;

    const period = dateFromObj && dateToObj
      ? `с ${dateFromObj.toLocaleDateString('ru-RU')} по ${dateToObj.toLocaleDateString('ru-RU')}`
      : 'за весь период';

    let accountInfo = accountName
      ? `Данные по счету "${accountName}"`
      : 'Данные по всем счетам';

    if (bankType) {
      accountInfo += ` (Банк: ${bankType})`;
    }

    let prompt = `${accountInfo} ${period}.`;

    if (budgetAmount != null && budgetAmount > 0) {
      prompt += `\n\nУстановленный бюджет: ${budgetAmount.toLocaleString('ru-RU')} руб.`;
    }

    prompt += `\n\nТранзакции:
${JSON.stringify(transactions, null, 2)}`;

    if (comment && comment.trim()) {
      prompt += `\n\nДополнительный комментарий пользователя:
${comment.trim()}

Учти этот комментарий при анализе и постарайся ответить на вопросы или учесть пожелания пользователя.`;
    }

    prompt += `\n\nПроанализируй эти данные и предоставь детальную аналитику согласно инструкциям.`;

    return prompt;
  }
}

