import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory rate limiter (подходит для single-instance и Beget VPS)
// На Vercel serverless - каждый cold start обнуляет, но всё равно защищает от burst
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > maxRequests;
}

// Очистка устаревших записей (каждые 60 сек)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, 60_000);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Rate limiting для API
  if (pathname.startsWith("/api/")) {
    const isAuth = pathname.includes("/auth/");
    const limit = isAuth ? 20 : 30; // 20/min для auth (NextAuth делает ~5 req/login), 30/min для остальных
    const window = 60_000;

    if (isRateLimited(`${ip}:${isAuth ? "auth" : "api"}`, limit, window)) {
      console.log(`[SECURITY] RATE_LIMIT_HIT | IP: ${ip} | Path: ${pathname} | Type: ${isAuth ? "auth" : "api"}`);
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // Rate limiting для tRPC booking.create (отдельный лимит)
  if (pathname.startsWith("/api/trpc/booking.create")) {
    if (isRateLimited(`${ip}:booking`, 10, 60_000)) {
      console.log(`[SECURITY] RATE_LIMIT_HIT | IP: ${ip} | Path: booking.create`);
      return NextResponse.json(
        { error: "Too many bookings" },
        { status: 429 }
      );
    }
  }

  // Защищённые маршруты
  const protectedPaths = ["/dashboard"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // Проверяем наличие JWT-токена в cookies
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Если авторизован и заходит на /login - редирект в dashboard
  if (pathname === "/login" && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/api/:path*"],
};
