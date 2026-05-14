"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(220, 53, 69, 0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 28,
        }}>!</div>
        <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Что-то пошло не так</h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 24 }}>
          {error.message || "Произошла непредвиденная ошибка. Попробуйте обновить страницу."}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="btn btn-primary btn-sm" onClick={reset}>
            Попробовать снова
          </button>
          <a href="/" className="btn btn-secondary btn-sm" style={{ textDecoration: "none" }}>
            На главную
          </a>
        </div>
      </div>
    </div>
  );
}
