import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RESTObooking - Бронирование ресторанов онлайн",
  description:
    "Забронируйте лучший столик в ресторанах Москвы, Петербурга и других городов. Реальная доступность, мгновенное подтверждение, депозиты онлайн.",
  keywords: [
    "бронирование ресторанов",
    "забронировать столик",
    "рестораны Москвы",
    "рестораны Петербурга",
    "онлайн бронирование",
    "RESTObooking",
  ],
  openGraph: {
    title: "RESTObooking - Бронирование ресторанов",
    description: "Найдите и забронируйте столик в лучших ресторанах",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="gradient-bg" />
        {children}
      </body>
    </html>
  );
}
