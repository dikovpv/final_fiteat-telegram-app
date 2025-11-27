# FitEat v0.3 — Telegram Mini-App (Next.js + grammy + Prisma + Postgres + Docker)

Запуск одной командой:
```bash
pnpm i
pnpm dev
pnpm prisma:migrate
```
(опционально) `pnpm seed`

## .env
Скопируй `.env.example` → `.env` и укажи:
```
DATABASE_URL=postgresql://fiteit:fiteit@localhost:5432/fiteit?schema=public
TELEGRAM_BOT_TOKEN=xxxx:yyyy
PUBLIC_APP_URL=http://localhost:3000
BOT_NAME=FitFoodBot
TELEGRAM_PROVIDER_TOKEN=  # опционально для Telegram Payments
```

## Что внутри
- apps/web — Next.js 15 (app router), Telegram WebApp SDK, страницы: /, /survey, /meals, /workouts
- apps/bot — grammy: /start (кнопка web_app), /buy (инвойс/заглушка)
- packages/db — Prisma (User с полями опроса), Meal, Workout
- API: /api/survey, /api/meals, /api/meals/[id], /api/workouts, /api/workouts/[id], /api/summary

### Новое в v0.3
- Возраст в опросе (User.age)
- API `/api/summary` — цели и потребление за сегодня
- Главная: кольцо калорий + шкалы БЖУ
