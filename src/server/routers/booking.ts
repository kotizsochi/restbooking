import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../trpc";
import { sendBookingNotification } from "@/lib/telegram";

export const bookingRouter = router({
  // Создать бронирование (публичный - гость может бронировать без регистрации)
  create: publicProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
        time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
        guestCount: z.number().min(1).max(20),
        guestName: z.string().min(2).max(100),
        guestPhone: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone"),
        guestEmail: z.string().email().optional(),
        tableId: z.string().optional(),
        specialRequests: z.string().max(500).optional(),
        source: z
          .enum([
            "PLATFORM_WEB",
            "PLATFORM_MOBILE",
            "WIDGET",
            "TELEGRAM_BOT",
            "TELEGRAM_MINIAPP",
          ])
          .default("PLATFORM_WEB"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // SEC-12: Запрет бронирования в прошлом
      const bookingDate = new Date(input.date + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (bookingDate < today) {
        throw new Error("Cannot book in the past");
      }

      // SEC-09: Sanitize specialRequests
      const sanitizedRequests = input.specialRequests
        ? input.specialRequests.replace(/<[^>]*>/g, "").trim()
        : null;

      if (!ctx.prisma) {
        // Demo-режим: возвращаем mock-бронирование
        return {
          id: `demo-${Date.now()}`,
          status: "PENDING",
          date: input.date,
          time: input.time,
          guestCount: input.guestCount,
          guestName: input.guestName,
          createdAt: new Date().toISOString(),
        };
      }

      // Найти или создать пользователя-гостя по телефону
      let user = await ctx.prisma.user.findUnique({
        where: { phone: input.guestPhone },
      });
      if (!user) {
        user = await ctx.prisma.user.create({
          data: {
            name: input.guestName,
            phone: input.guestPhone,
            email: input.guestEmail || null,
            role: "GUEST",
          },
        });
      }

      // Проверить доступность стола
      if (input.tableId) {
        const existingBooking = await ctx.prisma.reservation.findFirst({
          where: {
            tableId: input.tableId,
            date: new Date(input.date),
            time: input.time,
            status: { in: ["PENDING", "CONFIRMED", "SEATED"] },
          },
        });
        if (existingBooking) {
          throw new Error("Стол уже забронирован на это время");
        }
      }

      const reservation = await ctx.prisma.reservation.create({
        data: {
          userId: user.id,
          restaurantId: input.restaurantId,
          tableId: input.tableId || null,
          date: new Date(input.date),
          time: input.time,
          guestCount: input.guestCount,
          specialRequests: sanitizedRequests,
          source: input.source,
          status: "PENDING",
        },
        include: {
          restaurant: { select: { name: true, address: true } },
          table: { select: { label: true } },
        },
      });

      // Telegram уведомление (fire-and-forget)
      sendBookingNotification(input.restaurantId, {
        guestName: input.guestName,
        guestCount: input.guestCount,
        date: input.date,
        time: input.time,
        tableName: reservation.table?.label || undefined,
        specialRequests: input.specialRequests || undefined,
      }).catch(() => {});

      return reservation;
    }),

  // Отмена бронирования (публичный - по ID)
  cancel: publicProcedure
    .input(z.object({ bookingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.prisma) return { success: true };
      const booking = await ctx.prisma.reservation.findUnique({
        where: { id: input.bookingId },
      });
      if (!booking) throw new Error("Бронирование не найдено");
      if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
        throw new Error("Невозможно отменить");
      }
      await ctx.prisma.reservation.update({
        where: { id: input.bookingId },
        data: { status: "CANCELLED" },
      });
      return { success: true };
    }),

  // Обновить статус бронирования (админ)
  updateStatus: adminProcedure
    .input(
      z.object({
        bookingId: z.string(),
        status: z.enum(["PENDING", "CONFIRMED", "SEATED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.reservation.update({
        where: { id: input.bookingId },
        data: { status: input.status },
      });
      return booking;
    }),

  // Получить бронирования ресторана (админ)
  listByRestaurant: adminProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        date: z.string().optional(),
        status: z
          .enum(["PENDING", "CONFIRMED", "SEATED", "COMPLETED", "CANCELLED", "NO_SHOW"])
          .optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.prisma) {
        return { bookings: [], total: 0 };
      }
      const where: Record<string, unknown> = {
        restaurantId: input.restaurantId,
      };
      if (input.date) where.date = new Date(input.date);
      if (input.status) where.status = input.status;

      const [bookings, total] = await Promise.all([
        ctx.prisma.reservation.findMany({
          where,
          take: input.limit,
          skip: input.offset,
          orderBy: [{ date: "desc" }, { time: "asc" }],
          include: {
            user: { select: { name: true, phone: true, email: true } },
            table: { select: { label: true, tableType: true } },
          },
        }),
        ctx.prisma.reservation.count({ where }),
      ]);
      return { bookings, total };
    }),

  // Обновить статус бронирования (админ)
  updateStatus: adminProcedure
    .input(
      z.object({
        bookingId: z.string(),
        status: z.enum(["CONFIRMED", "SEATED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
        cancelReason: z.string().optional(),
        internalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.prisma) {
        return { id: input.bookingId, status: input.status };
      }

      // SEC-06: IDOR protection - проверяем принадлежность
      const reservation = await ctx.prisma.reservation.findUnique({
        where: { id: input.bookingId },
        include: { restaurant: { select: { ownerId: true } } },
      });
      if (!reservation || reservation.restaurant.ownerId !== ctx.user.id) {
        throw new Error("Booking not found or access denied");
      }

      const data: Record<string, unknown> = { status: input.status };
      if (input.status === "CONFIRMED") data.confirmedAt = new Date();
      if (input.status === "CANCELLED") {
        data.cancelledAt = new Date();
        data.cancelReason = input.cancelReason || null;
      }
      if (input.internalNotes) data.internalNotes = input.internalNotes;

      return ctx.prisma.reservation.update({
        where: { id: input.bookingId },
        data,
      });
    }),

  // Мои бронирования (авторизованный пользователь)
  myBookings: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.prisma) return [];
      return ctx.prisma.reservation.findMany({
        where: { userId: ctx.user.id! },
        take: input?.limit ?? 20,
        orderBy: { createdAt: "desc" },
        include: {
          restaurant: {
            select: { name: true, slug: true, address: true, coverImage: true },
          },
          table: { select: { label: true } },
        },
      });
    }),
  // Бронирования моего ресторана (для Dashboard владельца)
  myRestaurantBookings: protectedProcedure
    .input(
      z.object({
        date: z.string().optional(),
        status: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.prisma) return { bookings: [], total: 0, restaurant: null };

      // Находим ресторан текущего пользователя
      const restaurant = await ctx.prisma.restaurant.findFirst({
        where: { ownerId: ctx.user.id! },
        select: { id: true, name: true, slug: true, city: true },
      });
      if (!restaurant) return { bookings: [], total: 0, restaurant: null };

      const where: Record<string, unknown> = { restaurantId: restaurant.id };
      if (input?.date) where.date = new Date(input.date);
      if (input?.status) where.status = input.status;

      const [bookings, total] = await Promise.all([
        ctx.prisma.reservation.findMany({
          where,
          take: input?.limit ?? 50,
          orderBy: [{ date: "desc" }, { time: "asc" }],
          include: {
            user: { select: { name: true, phone: true, email: true } },
            table: { select: { label: true, tableType: true } },
          },
        }),
        ctx.prisma.reservation.count({ where }),
      ]);
      return { bookings, total, restaurant };
    }),

  // UX-08: Получить занятые слоты для даты/ресторана (публичный)
  getOccupiedSlots: publicProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.prisma) return { occupied: [] };
      const reservations = await ctx.prisma.reservation.findMany({
        where: {
          restaurantId: input.restaurantId,
          date: input.date,
          status: { in: ["PENDING", "CONFIRMED", "SEATED"] },
        },
        select: { time: true, tableId: true },
      });
      return { occupied: reservations };
    }),
});
