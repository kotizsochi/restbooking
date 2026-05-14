import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход - RESTObooking",
  description: "Войдите в личный кабинет для управления бронированиями",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
