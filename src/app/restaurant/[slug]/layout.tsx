import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Пытаемся получить данные ресторана для SEO
  if (prisma) {
    try {
      const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
        select: { name: true, description: true, city: true, address: true, coverImage: true, cuisine: true },
      });
      if (restaurant) {
        const cuisineText = (restaurant.cuisine as string[]).join(", ");
        return {
          title: `${restaurant.name} - Забронировать столик | RESTObooking`,
          description: restaurant.description || `Бронируйте столик в ${restaurant.name}, ${restaurant.city}. ${cuisineText}. Мгновенное подтверждение.`,
          openGraph: {
            title: `${restaurant.name} - RESTObooking`,
            description: `${restaurant.address || restaurant.city}. Онлайн бронирование.`,
            images: restaurant.coverImage ? [restaurant.coverImage] : [],
          },
        };
      }
    } catch {
      // Fallback to default
    }
  }

  return {
    title: `Ресторан - RESTObooking`,
    description: "Забронируйте столик онлайн с мгновенным подтверждением",
  };
}

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
