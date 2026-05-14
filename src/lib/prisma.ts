// Prisma client - будет активирован после настройки БД
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PrismaClientModule: any;
try {
  PrismaClientModule = require("@prisma/client").PrismaClient;
} catch {
  PrismaClientModule = null;
}

const globalForPrisma = globalThis as unknown as {
  prisma: unknown | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  (PrismaClientModule
    ? new PrismaClientModule({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
      })
    : null);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
