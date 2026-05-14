import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const tableSchema = z.object({
  label: z.string().min(1),
  x: z.number(),
  y: z.number(),
  type: z.enum(["STANDARD", "VIP", "BAR", "TERRACE", "PRIVATE", "LOUNGE"]),
  seats: z.number().min(1).max(50),
  shape: z.enum(["circle", "rect"]),
});

export const floorRouter = router({
  // Получить столы зала
  getLayout: protectedProcedure
    .input(z.object({ hallId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.prisma) {
        // Demo fallback
        return {
          hallId: "demo-hall",
          hallName: "Основной зал",
          tables: [
            { id: "t1", label: "1", x: 80, y: 80, type: "STANDARD" as const, seats: 4, shape: "rect" as const },
            { id: "t2", label: "2", x: 240, y: 80, type: "STANDARD" as const, seats: 2, shape: "circle" as const },
            { id: "t3", label: "VIP", x: 160, y: 200, type: "VIP" as const, seats: 8, shape: "rect" as const },
            { id: "t4", label: "3", x: 80, y: 200, type: "STANDARD" as const, seats: 4, shape: "circle" as const },
            { id: "t5", label: "Бар", x: 300, y: 200, type: "BAR" as const, seats: 2, shape: "circle" as const },
          ],
        };
      }

      const hallId = input.hallId;
      if (!hallId) {
        // Получить первый зал ресторана пользователя
        const restaurant = await ctx.prisma.restaurant.findFirst({
          where: { ownerId: ctx.session?.user?.id },
          include: { halls: { orderBy: { sortOrder: "asc" }, take: 1 } },
        });
        if (!restaurant?.halls?.[0]) {
          return { hallId: null, hallName: null, tables: [] };
        }
        const hall = restaurant.halls[0];
        const tables = await ctx.prisma.table.findMany({
          where: { hallId: hall.id },
          orderBy: { sortOrder: "asc" },
        });
        return {
          hallId: hall.id,
          hallName: hall.name,
          tables: tables.map((t) => ({
            id: t.id,
            label: t.label,
            x: t.positionX ?? 100,
            y: t.positionY ?? 100,
            type: t.tableType,
            seats: t.maxCapacity,
            shape: (t.shape as "circle" | "rect") || "rect",
          })),
        };
      }

      const hall = await ctx.prisma.hall.findUnique({ where: { id: hallId } });
      const tables = await ctx.prisma.table.findMany({
        where: { hallId },
        orderBy: { sortOrder: "asc" },
      });
      return {
        hallId,
        hallName: hall?.name || "Зал",
        tables: tables.map((t) => ({
          id: t.id,
          label: t.label,
          x: t.positionX ?? 100,
          y: t.positionY ?? 100,
          type: t.tableType,
          seats: t.maxCapacity,
          shape: (t.shape as "circle" | "rect") || "rect",
        })),
      };
    }),

  // Сохранить раскладку столов (batch)
  saveLayout: protectedProcedure
    .input(
      z.object({
        hallId: z.string(),
        tables: z.array(
          tableSchema.extend({ id: z.string().optional() })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.prisma) {
        return {
          success: true,
          savedCount: input.tables.length,
          message: "Demo: раскладка сохранена (mock).",
        };
      }

      // Удаляем все текущие столы и создаём заново (проще и надёжнее)
      const db = ctx.prisma;
      const hall = await db.hall.findUnique({ where: { id: input.hallId } });
      if (!hall) throw new Error("Зал не найден");
      await db.table.deleteMany({ where: { hallId: input.hallId } });

      const created = await Promise.all(
        input.tables.map((t, i) =>
          db.table.create({
            data: {
              restaurantId: hall.restaurantId,
              hallId: input.hallId,
              label: t.label,
              tableType: t.type,
              minCapacity: 1,
              maxCapacity: t.seats,
              positionX: Math.round(t.x),
              positionY: Math.round(t.y),
              shape: t.shape,
              sortOrder: i,
            },
          })
        )
      );

      return {
        success: true,
        savedCount: created.length,
        message: `Сохранено ${created.length} столов.`,
      };
    }),
});
