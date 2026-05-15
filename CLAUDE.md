# CLAUDE.md - RESTBooking Project Context

## Что это
SaaS-платформа онлайн-бронирования столиков в ресторанах. Каталог ресторанов + виджет для сайта ресторана + admin dashboard.

## Стек
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict: true)
- **API:** tRPC v11 + Tanstack Query v5
- **Auth:** NextAuth v5 (credentials, bcrypt, JWT 7 дней)
- **ORM:** Prisma 6 + Neon PostgreSQL (serverless adapter)
- **Bot:** grammY (Telegram)
- **Styling:** Vanilla CSS (custom properties, dark/light theme)
- **Deploy:** Docker standalone (Beget VPS) / Vercel (preview)

## Структура

```
src/
  app/
    page.tsx              # Главная: каталог ресторанов, поиск, фильтры
    login/page.tsx        # Авторизация (rate-limit aware)
    dashboard/page.tsx    # Admin: бронирования, конструктор зала, виджет, уведомления
    restaurant/[slug]/    # Страница ресторана + форма бронирования
    widget/[slug]/        # Iframe виджет для сайта ресторана
    for-restaurants/      # Лендинг + регистрация (4-step)
    privacy/              # Политика конфиденциальности
    api/
      health/             # GET: uptime, db status, timestamp
      telegram/           # POST: webhook grammY
      trpc/[trpc]/        # tRPC handler
      export/bookings/    # CSV экспорт бронирований
  components/
    Header, Footer, ThemeToggle, CookieConsent,
    FloorPlan, PhoneMaskedInput, SessionProvider
  server/
    routers/
      auth.ts             # register, login (bcrypt)
      booking.ts          # create, list, updateStatus, myRestaurantBookings
      floor.ts            # getLayout, saveLayout
      notification.ts     # getSettings, toggleChannel, sendTest
      restaurant.ts       # list, getBySlug, search
      waitlist.ts         # add, remove, list
  lib/
    auth.ts               # NextAuth config (credentials + JWT)
    prisma.ts             # Prisma client singleton (Neon adapter)
    trpc.tsx              # tRPC client + provider
    mock-data.ts          # Seed-данные для 10 ресторанов
    hooks.ts              # useDebounce
    security-logger.ts    # Rate-limit logging
    telegram.ts           # sendTelegramNotification helper
  env.ts                  # T3 Env: Zod validation для всех env vars
  middleware.ts           # Rate limiter (in-memory) + auth redirect
```

## Prisma Models (13)
User, Account, Session, Restaurant, Hall, Table, TimeSlot, SlotTable, Reservation, Review, Favorite, CRMSyncLog, WaitListEntry

## Ключевые решения

### Security
- **Rate limiting:** In-memory Map, 5 req/15s на login, 10 req/min на API
- **CSP headers:** Split config - `/widget/*` разрешает frame-ancestors * (iframe embedding), остальные страницы DENY
- **IDOR protection:** Бронирования фильтруются по session.user.id
- **Input sanitization:** HTML strip на текстовых полях
- **Passwords:** bcrypt 10 rounds, никогда не логируются

### Booking Logic
- **Double booking prevention:** Constraint table + date + time в Prisma
- **Past time restriction:** Нельзя забронировать прошедшее время (проверка на сервере)
- **Status flow:** pending -> confirmed -> seated -> completed | cancelled

### Dashboard Tabs
Заведения | Тарифы и оплата | Сотрудники | Статистика | Настройки

Settings sidebar: Схема зала (drag-and-drop) | Виджет (QR + iframe код) | Уведомления (5 toggles: SMS, TG, reminder, review, email)

## Environment Variables
```
DATABASE_URL          # PostgreSQL connection string
AUTH_SECRET           # NextAuth secret (min 16 chars)
AUTH_URL              # Canonical URL
APP_URL               # tRPC SSR base URL
DEMO_MODE             # true/false
DEMO_EMAIL            # admin@restobooking.ru
DEMO_PASSWORD         # demo2026
NEXT_PUBLIC_YM_ID     # Yandex.Metrika
NEXT_PUBLIC_GA_ID     # Google Analytics
NEXT_PUBLIC_BASE_URL  # Public URL
TELEGRAM_BOT_TOKEN    # grammY bot token
TELEGRAM_WEBHOOK_SECRET
SKIP_ENV_VALIDATION   # true for Docker build stage
```

## NPM Scripts
```bash
npm run dev        # Next.js dev (Turbopack)
npm run build      # Production build (standalone)
npm run lint       # ESLint strict (eqeqeq, unused-vars, array-callback)
npm run typecheck  # tsc --noEmit
npm run knip       # Dead code / unused deps scanner
npm run check      # typecheck + lint + knip + build (full CI)
```

## Credentials (DEMO)
- **Login:** admin@restobooking.ru / demo2026
- **Dashboard:** /dashboard (requires auth)
- **GitHub:** github.com/kotizsochi/restbooking

## Deploy (Beget VPS)
```bash
git clone https://github.com/kotizsochi/restbooking.git
cd restbooking/restbooking-app
cp .env.example .env  # fill in values
docker compose up -d
```

## Известные паттерны и gotchas
1. **Пустой массив truthy:** `[] || fallback` не работает - использовать `.length > 0`
2. **typeof Icon:** Lucide icons используются как `typeof Wine` для типизации Record
3. **Widget iframe:** Только `/widget/*` разрешает iframe, остальное DENY
4. **tRPC base URL:** `getBaseUrl()` в `lib/trpc.tsx` проверяет APP_URL -> VERCEL_URL -> localhost
5. **Prisma singleton:** `globalThis` pattern для dev hot-reload
6. **Rate limiter:** In-memory Map, обнуляется при redeploy (ок для single-instance VPS)
7. **Notification fallback:** Если ресторан не найден по ownerId, API возвращает дефолтные channels (не пустой массив)
