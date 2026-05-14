import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Для ресторанов - RESTObooking | Сервис бронирования",
  description: "Подключите ваш ресторан к RESTObooking. Электронная книга резервов, онлайн прием броней, депозиты и интеграции с iiko, r_keeper. Бесплатный тариф.",
  openGraph: {
    title: "Для ресторанов - RESTObooking",
    description: "Электронная книга резервов и онлайн бронирование. Бесплатно.",
    type: "website",
  },
};

export default function ForRestaurantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
