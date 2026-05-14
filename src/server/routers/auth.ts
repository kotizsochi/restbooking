import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { hashPassword } from "@/lib/auth";

export const authRouter = router({
  // Регистрация ресторана (4 шага)
  register: publicProcedure
    .input(
      z.object({
        // Шаг 1: Контакты
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(10),
        password: z.string().min(6),
        // Шаг 2: Ресторан
        restaurantName: z.string().min(2),
        city: z.string().min(2),
        address: z.string().min(5),
        cuisine: z.array(z.string()).min(1),
        // Шаг 3: Настройки
        maxPartySize: z.number().min(1).max(50).default(12),
        openingTime: z.string().default("10:00"),
        closingTime: z.string().default("23:00"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.prisma) {
        // Demo: возвращаем фейковый ответ
        return {
          success: true,
          userId: `demo-${Date.now()}`,
          restaurantId: `demo-rest-${Date.now()}`,
          message: "Demo: регистрация успешна. Подключите PostgreSQL для реального сохранения.",
        };
      }

      // Проверка уникальности email
      const existing = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existing) {
        throw new Error("Пользователь с таким email уже существует");
      }

      const passwordHash = await hashPassword(input.password);
      const slug = input.restaurantName
        .toLowerCase()
        .replace(/[^a-zа-яё0-9]/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      // Создаём пользователя и ресторан в транзакции
      const result = await ctx.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: input.name,
            email: input.email,
            phone: input.phone,
            passwordHash,
            role: "RESTAURANT_ADMIN",
          },
        });

        const restaurant = await tx.restaurant.create({
          data: {
            ownerId: user.id,
            name: input.restaurantName,
            slug: `${slug}-${user.id.slice(-4)}`,
            city: input.city,
            address: input.address,
            cuisine: input.cuisine as never[],
            maxPartySize: input.maxPartySize,
            openingTime: input.openingTime,
            closingTime: input.closingTime,
          },
        });

        // Создаём дефолтный зал "Основной"
        await tx.hall.create({
          data: {
            restaurantId: restaurant.id,
            name: "Основной зал",
            sortOrder: 0,
          },
        });

        return { user, restaurant };
      });

      return {
        success: true,
        userId: result.user.id,
        restaurantId: result.restaurant.id,
        message: "Регистрация успешна! Войдите с вашим email и паролем.",
      };
    }),
});
