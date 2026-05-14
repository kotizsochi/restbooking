import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { MOCK_RESTAURANTS as mockRestaurants } from "@/lib/mock-data";

export const restaurantRouter = router({
  // Получить список ресторанов (публичный)
  list: publicProcedure
    .input(
      z.object({
        city: z.string().optional(),
        cuisine: z.string().optional(),
        priceRange: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // Если есть БД - берём оттуда
      if (ctx.prisma) {
        const where: Record<string, unknown> = { isActive: true };
        if (input?.city) where.city = input.city;
        if (input?.cuisine) where.cuisine = { has: input.cuisine };
        if (input?.priceRange) where.priceRange = input.priceRange;
        if (input?.search) {
          where.OR = [
            { name: { contains: input.search, mode: "insensitive" } },
            { description: { contains: input.search, mode: "insensitive" } },
          ];
        }
        const [restaurants, total] = await Promise.all([
          ctx.prisma.restaurant.findMany({
            where,
            take: input?.limit ?? 20,
            skip: input?.offset ?? 0,
            orderBy: { avgRating: "desc" },
            include: {
              halls: { select: { id: true, name: true } },
              _count: { select: { reservations: true, reviews: true } },
            },
          }),
          ctx.prisma.restaurant.count({ where }),
        ]);
        return { restaurants, total };
      }

      // Fallback на mock-данные
      let filtered = [...mockRestaurants];
      if (input?.city) filtered = filtered.filter((r) => r.city === input.city);
      if (input?.cuisine)
        filtered = filtered.filter((r) =>
          r.cuisine.includes(input.cuisine as string)
        );
      if (input?.search) {
        const s = input.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.name.toLowerCase().includes(s) ||
            r.description.toLowerCase().includes(s)
        );
      }
      const offset = input?.offset ?? 0;
      const limit = input?.limit ?? 20;
      return {
        restaurants: filtered.slice(offset, offset + limit),
        total: filtered.length,
      };
    }),

  // Получить ресторан по slug (публичный)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.prisma) {
        const restaurant = await ctx.prisma.restaurant.findUnique({
          where: { slug: input.slug },
          include: {
            halls: {
              include: { tables: true },
              orderBy: { sortOrder: "asc" },
            },
            tables: true,
            reviews: {
              take: 10,
              orderBy: { createdAt: "desc" },
              include: { user: { select: { name: true, image: true } } },
            },
          },
        });
        return restaurant;
      }
      // Mock fallback
      return mockRestaurants.find((r) => r.slug === input.slug) ?? null;
    }),

  // Добавить в избранное (авторизованный)
  toggleFavorite: protectedProcedure
    .input(z.object({ restaurantId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.prisma) return { favorited: false };
      const existing = await ctx.prisma.favorite.findUnique({
        where: {
          userId_restaurantId: {
            userId: ctx.user.id!,
            restaurantId: input.restaurantId,
          },
        },
      });
      if (existing) {
        await ctx.prisma.favorite.delete({ where: { id: existing.id } });
        return { favorited: false };
      }
      await ctx.prisma.favorite.create({
        data: {
          userId: ctx.user.id!,
          restaurantId: input.restaurantId,
        },
      });
      return { favorited: true };
    }),
});
