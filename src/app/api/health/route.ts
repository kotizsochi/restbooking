import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Health check endpoint для Docker health checks и мониторинга.
 * GET /api/health
 *
 * Возвращает:
 * - status: "ok" | "degraded"
 * - db: "connected" | "disconnected"
 * - uptime: время работы в секундах
 * - timestamp: ISO timestamp
 */
export async function GET() {
  const start = Date.now();
  let dbStatus = "disconnected";

  try {
    if (prisma) {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    }
  } catch {
    dbStatus = "disconnected";
  }

  const responseTime = Date.now() - start;

  return NextResponse.json(
    {
      status: dbStatus === "connected" ? "ok" : "degraded",
      db: dbStatus,
      responseTime: `${responseTime}ms`,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
    },
    {
      status: dbStatus === "connected" ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
