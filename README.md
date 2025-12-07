<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

# Smart Account Backend

NestJS приложение для управления финансами с поддержкой AI-аналитики, интеграции с банками и GraphQL API.

## 🛠 Технологический стек

### Основной фреймворк и язык
- **Node.js** - серверная платформа
- **TypeScript** (v5.1.3) - язык программирования
- **NestJS** (v10.0.0) - прогрессивный Node.js фреймворк для создания эффективных и масштабируемых серверных приложений

### API и коммуникация
- **GraphQL** (v16.10.0) - язык запросов и среда выполнения
- **Apollo Server** (v4.11.2) - GraphQL сервер
- **@nestjs/graphql** (v12.2.2) - интеграция GraphQL с NestJS
- **@nestjs/apollo** (v12.2.2) - драйвер Apollo для NestJS
- **graphql-scalars** (v1.24.0) - дополнительные скалярные типы для GraphQL

### База данных
- **PostgreSQL** (v15-alpine) - реляционная база данных
- **TypeORM** (v0.3.20) - ORM для работы с базой данных
- **@nestjs/typeorm** (v10.0.2) - интеграция TypeORM с NestJS
- **pg** (v8.13.1) - драйвер PostgreSQL для Node.js

### Аутентификация и безопасность
- **Passport.js** (v0.7.0) - middleware для аутентификации
- **passport-jwt** (v4.0.1) - стратегия JWT для Passport
- **@nestjs/passport** (v11.0.5) - интеграция Passport с NestJS
- **@nestjs/jwt** (v10.2.0) - модуль JWT для NestJS
- **jsonwebtoken** (v9.0.2) - реализация JSON Web Tokens
- **bcrypt** (v5.1.1) - хеширование паролей

### Очереди и фоновые задачи
- **BullMQ** (v5.12.2) - система очередей на базе Redis
- **@nestjs/bullmq** (v10.0.0) - интеграция BullMQ с NestJS
- **Redis** (v7-alpine) - хранилище данных в памяти для очередей
- **ioredis** (v5.4.2) - клиент Redis для Node.js

### Хранилище файлов
- **MinIO** (latest) - S3-совместимое объектное хранилище
- **minio** (v7.1.3) - клиент MinIO для Node.js

### AI и машинное обучение
- **langchain-gigachat** (v0.0.14) - интеграция с GigaChat (российская AI-платформа)
- **GigaChat API** - API для работы с языковыми моделями Сбера

### Обработка файлов и медиа
- **sharp** (v0.33.5) - высокопроизводительная обработка изображений
- **heic-convert** (v2.1.0) - конвертация HEIC формата
- **content-disposition** (v0.5.4) - работа с заголовками Content-Disposition
- **stream-to-buffer** (v0.1.0) - преобразование потоков в буферы

### Работа с данными
- **axios** (v1.7.9) - HTTP клиент
- **@nestjs/axios** (v4.0.0) - интеграция Axios с NestJS
- **form-data** (v4.0.0) - работа с multipart/form-data
- **xlsx** (v0.18.5) - работа с Excel файлами
- **xlsx-js-style** (v1.2.0) - работа с Excel файлами со стилями
- **xml2js** (v0.6.2) - парсинг XML
- **decimal.js** (v10.6.0) - точные вычисления с десятичными числами
- **lodash** (v4.17.21) - утилиты для работы с данными

### Валидация и трансформация
- **class-validator** (v0.14.1) - валидация через декораторы
- **class-transformer** (v0.5.1) - трансформация объектов
- **joi** (v17.13.3) - схема валидации

### Утилиты
- **dayjs** (v1.11.13) - работа с датами и временем
- **uuid** (v11.0.5) - генерация UUID
- **seedrandom** (v3.0.5) - генерация псевдослучайных чисел
- **ms** (v2.1.3) - преобразование времени

### Email
- **nodemailer** (v6.10.0) - отправка email
- **@nestjs-modules/mailer** (v2.0.2) - модуль для отправки email в NestJS

### Планировщик задач
- **@nestjs/schedule** (v6.0.1) - планировщик задач (cron, интервалы)

### События
- **@nestjs/event-emitter** (v3.0.0) - система событий

### HTTP сервер
- **@nestjs/platform-express** (v10.0.0) - Express адаптер для NestJS

### Инструменты разработки
- **TypeScript** (v5.1.3) - компилятор TypeScript
- **ts-node** (v10.9.1) - выполнение TypeScript напрямую
- **ts-loader** (v9.4.3) - загрузчик TypeScript для webpack
- **tsconfig-paths** (v4.2.0) - поддержка path mapping

### Тестирование
- **Jest** (v29.7.0) - фреймворк для тестирования
- **ts-jest** (v29.2.5) - препроцессор TypeScript для Jest
- **supertest** (v6.3.3) - тестирование HTTP эндпоинтов
- **@nestjs/testing** (v10.0.0) - утилиты для тестирования NestJS
- **@testcontainers/postgresql** (v10.16.0) - контейнеры для интеграционных тестов PostgreSQL
- **@testcontainers/minio** (v10.17.2) - контейнеры для интеграционных тестов MinIO
- **nock** (v14.0.1) - мокирование HTTP запросов

### Линтинг и форматирование
- **ESLint** (v8.42.0) - линтер кода
- **@typescript-eslint/eslint-plugin** (v7.18.0) - ESLint плагин для TypeScript
- **@typescript-eslint/parser** (v7.18.0) - парсер TypeScript для ESLint
- **eslint-config-airbnb-base** (v15.0.0) - конфигурация Airbnb для ESLint
- **eslint-config-airbnb-typescript** (v18.0.0) - конфигурация Airbnb для TypeScript
- **eslint-plugin-import** (v2.31.0) - плагин для проверки импортов
- **eslint-plugin-prettier** (v5.0.0) - интеграция Prettier с ESLint
- **prettier** (v3.0.0) - форматировщик кода

### Конфигурация и окружение
- **dotenv-cli** (v8.0.0) - CLI для работы с .env файлами
- **dotenv** (v16.4.7) - загрузка переменных окружения

### Структура модулей
1. **AuthModule** - аутентификация и авторизация (JWT, регистрация, вход)
2. **UserModule** - управление пользователями
3. **FinanceModule** - управление финансами (счета, транзакции, бюджеты)
4. **FinanceAnalyticsModule** - AI-аналитика финансовых данных
5. **GigachatModule** - интеграция с GigaChat для AI-чатбота
6. **BanksModule** - интеграция с банками (Tinkoff Bank API)
7. **FileModule** - управление файлами и изображениями
8. **ConfigModule** - конфигурация приложения

### Инфраструктура
- **Docker** - контейнеризация
- **Docker Compose** - оркестрация контейнеров
- **Kubernetes** - оркестрация контейнеров (опционально)
- **Redis** - кеширование и очереди
- **PostgreSQL** - основная база данных
- **MinIO** - S3-совместимое хранилище файлов

## 🚀 Быстрый старт

### Docker Compose (Разработка)

Запуск полного стека для разработки:

```bash
# Запуск всех сервисов
docker-compose -f docker-compose.dev.yml up -d

# Просмотр логов
docker-compose -f docker-compose.dev.yml logs -f app

# Остановка
docker-compose -f docker-compose.dev.yml down
```

**Доступные сервисы:**

- Приложение: http://localhost:3000
- GraphQL Playground: http://localhost:3000/graphql
- MinIO Console: http://localhost:9001 (admin: 12356789 / 12345678)
- PostgreSQL: localhost:5432

### Kubernetes

#### Предварительные требования

- Kubernetes кластер (minikube, kind, или облачный)
- kubectl
- NGINX Ingress Controller (опционально)

#### Развертывание

```bash
# Переход в директорию k8s
cd k8s

# Сделать скрипт исполняемым
chmod +x deploy.sh

# Запуск развертывания
./deploy.sh
```

#### Ручное развертывание

```bash
cd k8s

# 1. Создание namespace
kubectl apply -f namespace.yaml

# 2. Конфигурация
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

# 3. База данных
kubectl apply -f postgres.yaml

# 4. Хранилище файлов
kubectl apply -f minio.yaml

# 5. Приложение
kubectl apply -f app.yaml

# 6. Автомасштабирование
kubectl apply -f hpa.yaml

# 7. Ingress (опционально)
kubectl apply -f ingress.yaml
```

#### Доступ к сервисам

**С Ingress:**

- Приложение: http://rentesy-app.local
- MinIO Console: http://minio.rentesy-app.local

**Через NodePort:**

- Приложение: http://localhost:30300
- MinIO Console: http://localhost:30901
- MinIO API: http://localhost:30900

#### Полезные команды

```bash
# Статус всех ресурсов
kubectl get all -n rentesy-app

# Логи приложения
kubectl logs -f deployment/rentesy-app-deployment -n rentesy-app

# Подключение к поду
kubectl exec -it deployment/rentesy-app-deployment -n rentesy-app -- /bin/sh

# Удаление всех ресурсов
kubectl delete namespace rentesy-app
```

## 🏗️ Архитектура

### Компоненты

- **NestJS App** - основное приложение
- **PostgreSQL** - база данных
- **MinIO** - S3-совместимое хранилище файлов

### Порты

- **3000** - NestJS приложение
- **5432** - PostgreSQL
- **9000** - MinIO API
- **9001** - MinIO Console

## 🔧 Конфигурация

### Переменные окружения

```bash
# База данных
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=1qa2ws3ed
DB_DATABASE=rentesy-app-template-dev

# S3 хранилище
S3_ENDPOINT=localhost
S3_PORT=9000
S3_ACCESS_KEY=12356789
S3_SECRET_KEY=12345678
S3_BUCKET_NAME=rentesy-bucket

# Приложение
NODE_ENV=dev
SERVER_PORT=3000
JWT_TOKEN_SECRET=dev-secret-key
JWT_USER_TOKEN_EXPIRES_IN=7d
```

## 📦 Сборка Docker образа

```bash
# Development
docker build -f Dockerfile.dev -t rentesy-app:dev .

# Production
docker build -t rentesy-app:latest .
```

## 🔄 CI/CD

GitHub Actions автоматически выполняет:

1. **Lint** - проверка кода
2. **Build** - сборка приложения
3. **E2E Tests** - интеграционные тесты

## 📝 API

- **REST API** - стандартные HTTP эндпоинты
- **GraphQL** - `/graphql` эндпоинт с Playground
- **File Upload** - `/files/upload` и `/images/upload`

## 🛠️ Разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run start:dev

# Сборка
npm run build

# Тесты
npm run test
npm run test:e2e

# Линтер
npm run lint:fix
```
