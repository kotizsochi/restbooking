import Link from "next/link";
import { Utensils } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: 24,
    }}>
      <div>
        <Utensils size={64} style={{ color: "var(--color-primary)", opacity: 0.5, marginBottom: 24 }} />
        <h1 style={{ fontSize: 72, fontWeight: 200, color: "var(--color-primary)", marginBottom: 8, letterSpacing: 4 }}>
          404
        </h1>
        <h2 style={{ fontSize: 22, fontWeight: 400, marginBottom: 12 }}>
          Страница не найдена
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 32, maxWidth: 400 }}>
          К сожалению, запрашиваемая страница не существует. Возможно, ресторан был удалён или ссылка устарела.
        </p>
        <Link href="/" className="btn btn-primary" style={{ gap: 8 }}>
          На главную
        </Link>
      </div>
    </div>
  );
}
