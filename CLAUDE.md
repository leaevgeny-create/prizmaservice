# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Проект

**Призма Сервис** — цифровая платформа-агрегатор на рынке шлифовки стекла и малярных работ. Бизнес-модель аналогична Uber: платформа соединяет заказчиков (генподрядчиков, застройщиков) с исполнителями (ООО, ИП, самозанятые). Все документы выставляются от лица ООО «Призма Сервис».

## Структура монорепо (pnpm workspaces + Turborepo)

```
apps/
  backend/   — NestJS + Prisma + PostgreSQL
  frontend/  — Next.js 15 + React 19 + Zustand + Tailwind CSS
packages/
  shared/    — общие TypeScript-типы
```

## Команды разработки

```bash
# Инфраструктура
docker-compose up -d           # запустить PostgreSQL, Redis, MongoDB, MinIO

# Монорепо
pnpm install                   # установить зависимости
pnpm dev                       # запустить frontend (3000) + backend (3001)

# Backend
pnpm --filter backend prisma migrate dev   # миграции БД
pnpm --filter backend prisma generate      # обновить Prisma Client
pnpm --filter backend prisma studio        # GUI для БД
pnpm --filter backend test                 # unit-тесты
pnpm --filter backend test --testPathPattern=rating  # один тест

# Frontend
pnpm --filter frontend dev     # только фронтенд
pnpm --filter frontend build   # production build
```

## Архитектура backend (NestJS)

Каждый модуль в `apps/backend/src/modules/` содержит `*.module.ts`, `*.service.ts`, `*.controller.ts`.

**Ключевые модули:**
- `auth` — JWT + Passport, регистрация, Госуслуги OAuth2, биометрия
- `orders` — жизненный цикл заявки со state machine (10 статусов, строгие переходы по ролям)
- `defects` — ведомость дефектов/объёмов, версионирование, согласование
- `acceptance` — приёмка работ с биометрией, формирование КС-2/КС-3
- `rating` — расчёт рейтинга исполнителя (40% сроки + 40% качество + 20% оценка заказчика)
- `documents` — генерация PDF через Puppeteer + Handlebars, хранение в S3/MinIO
- `materials` — учёт давальческих материалов, накладные
- `work-orders` — наряд-допуски с биометрическими подписями всех членов бригады
- `weather` — простои, интеграция с OpenWeatherMap, автопродление дедлайна
- `geolocation` — чекины исполнителей, формирование табеля
- `storage` — S3-совместимое хранилище (MinIO в dev, S3 в prod)

**Интеграции** (в `src/integrations/`):
- `gosuslugi` — ЕСИА OAuth2, проверка самозанятых через ФНС
- `biometric` — BioAPI / WebAuthn (в dev-режиме всегда возвращает `true`)
- `weather` — OpenWeatherMap + Яндекс.Погода
- `edo` — ЭДО (заглушка, в prod — КриптоПро/Диадок)
- `payment` — платёжный шлюз (заглушка)

**Роли** (enum `Role` в Prisma):
- `AGGREGATOR_ADMIN/MANAGER/FINANCE/SECURITY` — сотрудники Призма Сервис
- `CUSTOMER_ADMIN/MANAGER/SAFETY` — заказчик
- `EXECUTOR_COMPANY/IP/SELF_EMPLOYED` — исполнитель
- `EXPERT` — эксперт/технадзор

Авторизация: JWT Bearer, `@Roles(...)` + `RolesGuard`.

## Архитектура frontend (Next.js App Router)

```
src/app/
  auth/                    — логин, регистрация (2-шаговая с выбором роли)
  (aggregator)/            — ЛК агрегатора
  (customer)/              — ЛК заказчика
    dashboard/             — сводка, активные заявки
    defects/[orderId]/     — ведомость дефектов с фотофиксацией
    acceptance/[orderId]/  — приёмка с биометрией, КС-2/КС-3
    materials/[objectId]/  — давальческие материалы
    analytics/             — дашборд реального времени (recharts)
  (executor)/              — ЛК исполнителя
    work-orders/[orderId]/ — наряд-допуски с биометрическими подписями
```

**State management:** Zustand (`src/store/auth.store.ts`) с persist.
**API:** axios instance в `src/lib/api.ts` с авторизацией и авто-рефрешем токена.
**Типы:** `src/types/index.ts` — все доменные типы, labels для enum'ов.

## Схема БД (Prisma — ключевые сущности)

`User` → `UserProfile` (1:1), `CompanyMember[]`, `BiometricRecord[]`
`Company` → `CompanyMember[]`, `Document[]`, `ConstructionObject[]`
`Order` → статус-машина, связывает `customer`, `executor`, `manager`
`DefectStatement` (версионированная ведомость) → `DefectItem[]` → `Photo[]`
`WorkAcceptance` → `AcceptanceItem[]`, `AcceptanceRemark[]`, `Act[]` (КС-2, КС-3)
`MaterialStock` → `MaterialMovement[]` (ISSUE/RETURN/WRITEOFF)
`WorkOrder` → `WorkOrderSignature[]` (биометрия каждого члена бригады)
`ExecutorRating` → рассчитывается при завершении заявки
`WeatherStop` → валидируется через метео-API, продлевает `Order.actualEndDate`
`Dispute` → `DisputeMessage[]`, назначается `Expert`

## Бизнес-правила

- **Переходы статусов заявки** строго проверяются в `OrdersService.validateStatusTransition` — нельзя пропустить шаг
- **Биометрия обязательна** при: приёмке работ, подписании каждого наряд-допуска членом бригады, подписании актов
- **Рейтинг исполнителя:** `(onTime×0.4) + (quality×0.4) + (customer×0.2)`, где quality падает при >1 замечания
- **Рейтинг компании** = среднее рейтингов всех исполнителей компании по виду работ
- **Метеопростой:** исполнитель отмечает → сервер сверяет с API погоды → агрегатор одобряет → дедлайн автоматически продлевается
- **Документы** (КС-2, КС-3, наряд-допуски) генерируются как PDF через Puppeteer и хранятся в S3
- **Все договоры** выставляются от лица ООО «Призма Сервис», не напрямую между заказчиком и исполнителем
