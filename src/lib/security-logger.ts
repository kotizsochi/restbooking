/**
 * SEC-18: Минимальный security event logger
 * Логирует auth events, rate limit hits, IDOR attempts
 * В production на Beget - можно расширить до файлового/Telegram лога
 */

type SecurityEventType =
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGIN_FAILED"
  | "AUTH_LOGOUT"
  | "RATE_LIMIT_HIT"
  | "IDOR_ATTEMPT"
  | "WEBHOOK_INVALID_SECRET"
  | "BOOKING_PAST_DATE"
  | "INPUT_VALIDATION_FAILED";

interface SecurityEvent {
  type: SecurityEventType;
  ip?: string;
  userId?: string;
  details?: string;
  timestamp: string;
}

// In-memory buffer (последние 100 событий для диагностики)
const eventBuffer: SecurityEvent[] = [];
const MAX_BUFFER = 100;

export function logSecurityEvent(
  type: SecurityEventType,
  opts?: { ip?: string; userId?: string; details?: string }
) {
  const event: SecurityEvent = {
    type,
    ip: opts?.ip,
    userId: opts?.userId,
    details: opts?.details,
    timestamp: new Date().toISOString(),
  };

  // Console log (видно в Vercel/Beget логах)
  console.log(
    `[SECURITY] ${event.type} | IP: ${event.ip || "unknown"} | User: ${event.userId || "anon"} | ${event.details || ""}`
  );

  // Buffer для runtime доступа
  eventBuffer.push(event);
  if (eventBuffer.length > MAX_BUFFER) {
    eventBuffer.shift();
  }
}

export function getRecentSecurityEvents(): SecurityEvent[] {
  return [...eventBuffer];
}
