import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Личный кабинет - RESTObooking",
  description: "Управление бронированиями, настройками и статистикой вашего ресторана",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
