import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { TRPCReactProvider } from "@/lib/trpc";
import { CookieConsent } from "@/components/CookieConsent";

// PERF-03: next/font self-hosts шрифт (не render-blocking)
const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["200", "300", "400", "500", "600"],
  display: "swap",
  variable: "--font-montserrat",
});

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
  // FE-05: manifest + icons
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
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
    <html lang="ru" className={montserrat.variable}>
      <head>
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

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "RESTObooking",
              "url": "https://restobooking.ru",
              "description": "Сервис бронирования столиков в ресторанах. Электронная книга резервов, онлайн прием броней, депозиты.",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "RUB",
                "description": "Бесплатный тариф до 300 заявок в месяц"
              },
              "creator": {
                "@type": "Organization",
                "name": "RESTObooking",
                "url": "https://restobooking.ru"
              }
            }),
          }}
        />
      </head>
      <body>
        <div className="gradient-bg" />
        <SessionProvider>
          <TRPCReactProvider>
            {children}
            <CookieConsent />
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
