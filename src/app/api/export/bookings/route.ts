import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!prisma) {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }

  // Находим ресторан владельца
  const userId = (session.user as { id?: string }).id;
  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId: userId || "" },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const dateFrom = url.searchParams.get("from");
  const dateTo = url.searchParams.get("to");

  const where: Record<string, unknown> = { restaurantId: restaurant.id };
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom);
    if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo);
  }

  const bookings = await prisma.reservation.findMany({
    where,
    take: 10000, // SEC-13: Limit to prevent OOM
    orderBy: [{ date: "desc" }, { time: "asc" }],
    include: {
      user: { select: { name: true, phone: true, email: true } },
      table: { select: { label: true, tableType: true } },
    },
  });

  // BOM для Excel (UTF-8)
  const BOM = "\uFEFF";
  const header = "ID;Дата;Время;Гость;Телефон;Email;Гостей;Стол;Тип стола;Статус;Комментарий;Источник;Создано\n";
  const rows = bookings.map((b) => {
    const date = b.date instanceof Date ? b.date.toISOString().split("T")[0] : String(b.date);
    const statusMap: Record<string, string> = {
      PENDING: "Новый", CONFIRMED: "Подтверждён", SEATED: "Пришёл",
      COMPLETED: "Завершён", CANCELLED: "Отменён", NO_SHOW: "Не пришёл",
    };
    return [
      b.id,
      date,
      b.time,
      b.user?.name || "",
      b.user?.phone || "",
      b.user?.email || "",
      b.guestCount,
      b.table?.label || "",
      b.table?.tableType || "",
      statusMap[b.status] || b.status,
      (b.specialRequests || "").replace(/;/g, ","),
      b.source || "",
      b.createdAt instanceof Date ? b.createdAt.toISOString() : String(b.createdAt),
    ].join(";");
  });

  const csv = BOM + header + rows.join("\n");
  const filename = `bookings_${restaurant.slug}_${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
