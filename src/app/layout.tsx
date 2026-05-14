import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";

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
    url: "https://restobooking.ru",
  },
};

// Яндекс.Метрика ID (заменить на реальный после регистрации)
const YM_ID = process.env.NEXT_PUBLIC_YM_ID || "";
// Google Analytics ID
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

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

        {/* Яндекс.Метрика */}
        {YM_ID && (
          <script dangerouslySetInnerHTML={{ __html: `
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
            ym(${YM_ID}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });
          `}} />
        )}

        {/* Google Analytics */}
        {GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}} />
          </>
        )}
      </head>
      <body>
        <div className="gradient-bg" />
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
