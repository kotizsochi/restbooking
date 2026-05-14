import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Валидация environment переменных через Zod.
 * Если переменная отсутствует или неправильного типа - build упадёт
 * с понятным сообщением, а не молча сломается в runtime.
 */
export const env = createEnv({
  // Серверные (недоступны в браузере)
  server: {
    DATABASE_URL: z.string().url().optional(),
    AUTH_SECRET: z.string().min(16).optional(),
    AUTH_URL: z.string().url().optional(),
    APP_URL: z.string().url().optional(),
    DEMO_MODE: z.enum(["true", "false"]).default("false"),
    DEMO_EMAIL: z.string().email().default("admin@restobooking.ru"),
    DEMO_PASSWORD: z.string().min(4).default("demo2026"),
    TELEGRAM_BOT_TOKEN: z.string().optional(),
    TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },

  // Клиентские (доступны в браузере, NEXT_PUBLIC_ префикс)
  client: {
    NEXT_PUBLIC_YM_ID: z.string().optional(),
    NEXT_PUBLIC_GA_ID: z.string().optional(),
    NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  },

  // Runtime значения (Next.js edge)
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    APP_URL: process.env.APP_URL,
    DEMO_MODE: process.env.DEMO_MODE,
    DEMO_EMAIL: process.env.DEMO_EMAIL,
    DEMO_PASSWORD: process.env.DEMO_PASSWORD,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_YM_ID: process.env.NEXT_PUBLIC_YM_ID,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },

  // Пропускать валидацию в CI/Docker build (переменные подставляются позже)
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  // Пустые строки считать как undefined
  emptyStringAsUndefined: true,
});
