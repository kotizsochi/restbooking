import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const waitListRouter = router({
  // Гость встаёт в очередь (публичный)
  join: publicProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        guestName: z.string().min(2),
        guestPhone: z.string().min(10),
        guestCount: z.number().min(1).max(20).default(2),
        preferredDate: z.string().optional(),
        preferredTime: z.string().optional(),
        notifyVia: z.enum(["telegram", "sms", "email"]).default("telegram"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.prisma) {
        return { id: `demo-wl-${Date.now()}`, status: "WAITING" };
      }

      // Проверяем дубликат (тот же телефон + ресторан + WAITING)
      const existing = await ctx.prisma.waitListEntry.findFirst({
        where: {
          restaurantId: input.restaurantId,
          guestPhone: input.guestPhone,
          status: "WAITING",
        },
      });
      if (existing) {
        return { id: existing.id, status: "ALREADY_WAITING", message: "Вы уже в листе ожидания" };
      }

      const entry = await ctx.prisma.waitListEntry.create({
        data: {
          restaurantId: input.restaurantId,
          guestName: input.guestName,
          guestPhone: input.guestPhone,
          guestCount: input.guestCount,
          preferredDate: input.preferredDate || null,
          preferredTime: input.preferredTime || null,
          notifyVia: input.notifyVia,
        },
      });

      return { id: entry.id, status: "WAITING", message: "Вы добавлены в лист ожидания" };
    }),

  // Получить лист ожидания ресторана (для Dashboard)
  listByRestaurant: protectedProcedure
    .input(z.object({ restaurantId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      if (!ctx.prisma) return { entries: [], total: 0 };

      let restaurantId = input?.restaurantId;
      if (!restaurantId) {
        const restaurant = await ctx.prisma.restaurant.findFirst({
          where: { ownerId: ctx.user.id! },
          select: { id: true },
        });
        restaurantId = restaurant?.id;
      }
      if (!restaurantId) return { entries: [], total: 0 };

      const entries = await ctx.prisma.waitListEntry.findMany({
        where: { restaurantId, status: "WAITING" },
        orderBy: { createdAt: "asc" },
      });

      return { entries, total: entries.length };
    }),

  // Убрать из очереди (отмена гостем или admin)
  remove: publicProcedure
    .input(z.object({ entryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.prisma) return { success: true };
      await ctx.prisma.waitListEntry.update({
        where: { id: input.entryId },
        data: { status: "EXPIRED" },
      });
      return { success: true };
    }),
});
