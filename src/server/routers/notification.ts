import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const notificationChannels = z.enum(["sms", "telegram", "email", "push"]);

export const notificationRouter = router({
  // Получить настройки уведомлений ресторана
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.prisma) {
      return {
        channels: [
          { key: "sms_new_booking", label: "SMS о новом бронировании", desc: "Гость получит SMS с подтверждением", enabled: true, channel: "sms" as const },
          { key: "tg_new_booking", label: "Telegram уведомление", desc: "Мгновенное оповещение бота в чат ресторана", enabled: true, channel: "telegram" as const },
          { key: "sms_reminder", label: "Напоминание за 2 часа", desc: "Напомнить гостю о бронировании", enabled: false, channel: "sms" as const },
          { key: "email_review", label: "Запрос отзыва", desc: "На следующий день после визита", enabled: false, channel: "email" as const },
          { key: "email_confirm", label: "Email подтверждение", desc: "Дублировать подтверждение на почту", enabled: false, channel: "email" as const },
        ],
        telegramBotToken: null,
        telegramChatId: null,
      };
    }

    const restaurant = await ctx.prisma.restaurant.findFirst({
      where: { ownerId: ctx.session?.user?.id },
    });

    if (!restaurant) {
      // Fallback: дефолтные каналы если ресторан не привязан к текущему user
      return {
        channels: [
          { key: "sms_new_booking", label: "SMS о новом бронировании", desc: "Гость получит SMS с подтверждением", enabled: true, channel: "sms" as const },
          { key: "tg_new_booking", label: "Telegram уведомление", desc: "Мгновенное оповещение бота в чат ресторана", enabled: true, channel: "telegram" as const },
          { key: "sms_reminder", label: "Напоминание за 2 часа", desc: "Напомнить гостю о бронировании", enabled: false, channel: "sms" as const },
          { key: "email_review", label: "Запрос отзыва", desc: "На следующий день после визита", enabled: false, channel: "email" as const },
          { key: "email_confirm", label: "Email подтверждение", desc: "Дублировать подтверждение на почту", enabled: false, channel: "email" as const },
        ],
        telegramBotToken: null,
        telegramChatId: null,
      };
    }

    // Возвращаем из JSON настроек ресторана
    const settings = (restaurant as Record<string, unknown>).notificationSettings as Record<string, boolean> | null;
    return {
      channels: [
        { key: "sms_new_booking", label: "SMS о новом бронировании", desc: "Гость получит SMS с подтверждением", enabled: settings?.sms_new_booking ?? true, channel: "sms" as const },
        { key: "tg_new_booking", label: "Telegram уведомление", desc: "Мгновенное оповещение бота в чат ресторана", enabled: settings?.tg_new_booking ?? false, channel: "telegram" as const },
        { key: "sms_reminder", label: "Напоминание за 2 часа", desc: "Напомнить гостю о бронировании", enabled: settings?.sms_reminder ?? false, channel: "sms" as const },
        { key: "email_review", label: "Запрос отзыва", desc: "На следующий день после визита", enabled: settings?.email_review ?? false, channel: "email" as const },
        { key: "email_confirm", label: "Email подтверждение", desc: "Дублировать подтверждение на почту", enabled: settings?.email_confirm ?? false, channel: "email" as const },
      ],
      telegramBotToken: null,
      telegramChatId: null,
    };
  }),

  // Переключить канал уведомлений
  toggleChannel: protectedProcedure
    .input(z.object({
      key: z.string(),
      enabled: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.prisma) {
        return { success: true, key: input.key, enabled: input.enabled };
      }

      const restaurant = await ctx.prisma.restaurant.findFirst({
        where: { ownerId: ctx.session?.user?.id },
      });

      if (!restaurant) throw new Error("Ресторан не найден");

      const currentSettings = ((restaurant as Record<string, unknown>).notificationSettings as Record<string, boolean>) || {};
      const updatedSettings = { ...currentSettings, [input.key]: input.enabled };

      await ctx.prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { notificationSettings: updatedSettings as never },
      });

      return { success: true, key: input.key, enabled: input.enabled };
    }),

  // Отправить тестовое уведомление
  sendTest: protectedProcedure
    .input(z.object({
      channel: notificationChannels,
      destination: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Заглушка - в production будет интеграция с SMS/Telegram/Email провайдерами
      return {
        success: true,
        channel: input.channel,
        message: `Тестовое уведомление отправлено через ${input.channel}`,
      };
    }),
});
