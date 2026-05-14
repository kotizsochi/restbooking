import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // SEC-14/15/16: Security headers
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-XSS-Protection", value: "1; mode=block" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(self)",
      },
    ];

    const cspBase = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mc.yandex.ru https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://api.qrserver.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://mc.yandex.ru https://www.google-analytics.com",
    ];

    return [
      // Widget: разрешаем iframe embedding (рестораны встраивают на свой сайт)
      {
        source: "/widget/:slug*",
        headers: [
          ...securityHeaders,
          {
            key: "Content-Security-Policy",
            value: [...cspBase, "frame-ancestors *"].join("; "),
          },
        ],
      },
      // Все остальные страницы: запрещаем iframe
      {
        source: "/((?!widget).*)",
        headers: [
          ...securityHeaders,
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: [...cspBase, "frame-ancestors 'none'"].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
