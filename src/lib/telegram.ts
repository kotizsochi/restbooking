import { Bot } from "grammy";
import { prisma } from "@/lib/prisma";

// Singleton бот - инициализируется один раз
let bot: Bot | null = null;

export function getBot(): Bot | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  if (!bot) {
    bot = new Bot(token);

    // /start - привязка Telegram к ресторану
    bot.command("start", async (ctx) => {
      const chatId = ctx.chat.id;
      const args = ctx.match; // deeplink: /start <restaurant_slug>

      if (args && prisma) {
        const restaurant = await prisma.restaurant.findUnique({
          where: { slug: args },
        });
        if (restaurant) {
          // Сохраняем chatId в notificationSettings ресторана
          const settings = (restaurant.notificationSettings as Record<string, unknown>) || {};
          settings.telegramChatId = String(chatId);
          settings.telegramEnabled = true;

          await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: { notificationSettings: settings as object },
          });

          await ctx.reply(
            `Telegram подключен к "${restaurant.name}"!\n\n` +
            `Теперь вы будете получать уведомления о новых бронированиях.\n\n` +
            `Команды:\n` +
            `/status - статус бронирований\n` +
            `/today - бронирования на сегодня\n` +
            `/help - помощь`
          );
          return;
        }
      }

      await ctx.reply(
        "Добро пожаловать в RESTObooking Bot!\n\n" +
        "Для подключения к ресторану используйте ссылку из Dashboard.\n" +
        "Или введите /connect <slug> для привязки."
      );
    });

    // /today - бронирования на сегодня
    bot.command("today", async (ctx) => {
      if (!prisma) {
        await ctx.reply("БД недоступна");
        return;
      }
      const chatId = String(ctx.chat.id);

      // Найти ресторан по chatId
      const restaurants = await prisma.restaurant.findMany({
        where: { isActive: true },
      });
      const restaurant = restaurants.find((r) => {
        const settings = r.notificationSettings as Record<string, unknown> | null;
        return settings?.telegramChatId === chatId;
      });

      if (!restaurant) {
        await ctx.reply("Ресторан не привязан. Используйте /start <slug>");
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const bookings = await prisma.reservation.findMany({
        where: {
          restaurantId: restaurant.id,
          date: { gte: today, lt: tomorrow },
          status: { in: ["PENDING", "CONFIRMED", "SEATED"] },
        },
        include: {
          user: { select: { name: true, phone: true } },
          table: { select: { label: true } },
        },
        orderBy: { time: "asc" },
      });

      if (bookings.length === 0) {
        await ctx.reply(`${restaurant.name}: На сегодня бронирований нет.`);
        return;
      }

      const lines = bookings.map((b, i) => {
        const status = b.status === "PENDING" ? "Новый" : b.status === "CONFIRMED" ? "Подтв." : "Пришёл";
        return `${i + 1}. ${b.time} | ${b.user?.name || "Гость"} | ${b.guestCount} чел. | ${b.table?.label || "N/A"} | ${status}`;
      });

      await ctx.reply(
        `${restaurant.name} - Сегодня (${bookings.length}):\n\n${lines.join("\n")}`
      );
    });

    // /status - краткая статистика
    bot.command("status", async (ctx) => {
      if (!prisma) return;
      const chatId = String(ctx.chat.id);
      const restaurants = await prisma.restaurant.findMany({ where: { isActive: true } });
      const restaurant = restaurants.find((r) => {
        const s = r.notificationSettings as Record<string, unknown> | null;
        return s?.telegramChatId === chatId;
      });
      if (!restaurant) {
        await ctx.reply("Ресторан не привязан.");
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [pending, confirmed, total] = await Promise.all([
        prisma.reservation.count({ where: { restaurantId: restaurant.id, date: { gte: today, lt: tomorrow }, status: "PENDING" } }),
        prisma.reservation.count({ where: { restaurantId: restaurant.id, date: { gte: today, lt: tomorrow }, status: "CONFIRMED" } }),
        prisma.reservation.count({ where: { restaurantId: restaurant.id, date: { gte: today, lt: tomorrow } } }),
      ]);

      await ctx.reply(
        `${restaurant.name}\n\n` +
        `Сегодня: ${total} бронирований\n` +
        `Новых: ${pending}\n` +
        `Подтвержденных: ${confirmed}`
      );
    });

    bot.command("help", async (ctx) => {
      await ctx.reply(
        "RESTObooking Bot\n\n" +
        "/today - бронирования на сегодня\n" +
        "/status - краткая статистика\n" +
        "/help - эта справка\n\n" +
        "Бот автоматически уведомляет о новых бронированиях."
      );
    });
  }

  return bot;
}

// Отправка уведомления о новом бронировании
export async function sendBookingNotification(restaurantId: string, booking: {
  guestName: string;
  guestCount: number;
  date: string;
  time: string;
  tableName?: string;
  specialRequests?: string;
}) {
  if (!prisma) return;
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });
  if (!restaurant) return;

  const settings = restaurant.notificationSettings as Record<string, unknown> | null;
  if (!settings?.telegramEnabled || !settings?.telegramChatId) return;

  const chatId = settings.telegramChatId as string;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  const text =
    `Новое бронирование!\n\n` +
    `Гость: ${booking.guestName}\n` +
    `Дата: ${booking.date}\n` +
    `Время: ${booking.time}\n` +
    `Гостей: ${booking.guestCount}\n` +
    (booking.tableName ? `Стол: ${booking.tableName}\n` : "") +
    (booking.specialRequests ? `Комментарий: ${booking.specialRequests}\n` : "") +
    `\nПодтвердите в Dashboard.`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch (e) {
    console.error("Telegram notification error:", e);
  }
}
