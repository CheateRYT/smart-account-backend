import { registerEnumType } from '@nestjs/graphql';

export enum BudgetCategory {
  ENTERTAINMENT = 'ENTERTAINMENT',
  CINEMA = 'CINEMA',
  RESTAURANTS = 'RESTAURANTS',
  TRANSPORT = 'TRANSPORT',
  GROCERIES = 'GROCERIES',
  CLOTHING = 'CLOTHING',
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
  UTILITIES = 'UTILITIES',
  INTERNET = 'INTERNET',
  MOBILE = 'MOBILE',
  TECH = 'TECH',
  GIFTS = 'GIFTS',
  TRAVEL = 'TRAVEL',
  SPORTS = 'SPORTS',
  BOOKS = 'BOOKS',
  BEAUTY = 'BEAUTY',
  HOME = 'HOME',
  PETS = 'PETS',
  OTHER = 'OTHER',
}

registerEnumType(BudgetCategory, {
  name: 'BudgetCategory',
  description:
    'Категория бюджета: ENTERTAINMENT - Развлечения, CINEMA - Кино, RESTAURANTS - Рестораны, TRANSPORT - Транспорт, GROCERIES - Продукты, CLOTHING - Одежда, HEALTH - Здоровье, EDUCATION - Образование, UTILITIES - Коммунальные услуги, INTERNET - Интернет, MOBILE - Мобильная связь, TECH - Техника, GIFTS - Подарки, TRAVEL - Путешествия, SPORTS - Спорт, BOOKS - Книги, BEAUTY - Красота, HOME - Дом, PETS - Домашние животные, OTHER - Другое',
});
