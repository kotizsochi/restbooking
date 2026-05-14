import { webhookCallback } from "grammy";
import { getBot } from "@/lib/telegram";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // SEC-04: Верификация webhook secret
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (webhookSecret) {
    const headerSecret = req.headers.get("x-telegram-bot-api-secret-token");
    if (headerSecret !== webhookSecret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const bot = getBot();
  if (!bot) {
    return NextResponse.json({ error: "Bot not configured" }, { status: 503 });
  }
  try {
    const handler = webhookCallback(bot, "std/http");
    return await handler(req);
  } catch (e) {
    console.error("Telegram webhook error:", e);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    bot: process.env.TELEGRAM_BOT_TOKEN ? "configured" : "not configured",
  });
}
