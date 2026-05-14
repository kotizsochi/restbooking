import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://restobooking.ru";

  // Статические страницы
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/for-restaurants`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Динамические страницы ресторанов
  let restaurantPages: MetadataRoute.Sitemap = [];
  try {
    // Импортируем prisma динамически чтобы не ломать build без БД
    const { prisma } = await import("@/lib/prisma");
    if (prisma) {
      const restaurants = await prisma.restaurant.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      });
      restaurantPages = restaurants.map((r) => ({
        url: `${baseUrl}/restaurant/${r.slug}`,
        lastModified: r.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Fallback: если нет БД, пропускаем динамические страницы
  }

  return [...staticPages, ...restaurantPages];
}
