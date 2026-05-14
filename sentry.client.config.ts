import * as Sentry from "@sentry/nextjs";

/**
 * Sentry: отлавливает runtime ошибки в production.
 * DSN настраивается через env NEXT_PUBLIC_SENTRY_DSN.
 *
 * Для получения DSN:
 * 1. Зарегистрироваться на sentry.io
 * 2. Создать проект (Next.js)
 * 3. Скопировать DSN в .env
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",

  // Процент транзакций для трейсинга (0.1 = 10%)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

  // Не инициализировать если DSN не задан
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Скрыть PII (Personal Identifiable Information)
  sendDefaultPii: false,

  // Игнорировать шумные ошибки
  ignoreErrors: [
    "ResizeObserver loop",
    "Network request failed",
    "Load failed",
    "ChunkLoadError",
  ],

  // Environment tag
  environment: process.env.NODE_ENV || "development",
});
