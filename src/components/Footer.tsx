import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ padding: "40px 0", background: "var(--color-bg-secondary)" }}>
      <div className="container" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 32,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "var(--radius-sm)",
              background: "var(--color-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 500, color: "#ffffff",
            }}>R</div>
            <span style={{ fontSize: 15, fontWeight: 500 }}>RESTO<span style={{ color: "var(--color-primary)" }}>booking</span></span>
          </div>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", maxWidth: 260 }}>
            Сервис бронирования и книга резервов для ресторанов
          </p>
        </div>
        {[
          { title: "ГОСТЯМ", links: [{ text: "Рестораны", href: "/" }, { text: "Политика", href: "/privacy" }] },
          { title: "РЕСТОРАНАМ", links: [{ text: "Подключение", href: "/for-restaurants" }, { text: "Тарифы", href: "/for-restaurants" }] },
          { title: "КОМПАНИЯ", links: [{ text: "Контакты", href: "mailto:support@restobooking.ru" }, { text: "Конфиденциальность", href: "/privacy" }] },
        ].map((col) => (
          <div key={col.title}>
            <h4 style={{ fontSize: 11, fontWeight: 500, marginBottom: 12, color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>{col.title}</h4>
            {col.links.map((link) => (
              <Link key={link.text} href={link.href} style={{ display: "block", fontSize: 13, color: "var(--color-text-secondary)", textDecoration: "none", marginBottom: 8, transition: "color var(--transition-fast)" }}>{link.text}</Link>
            ))}
          </div>
        ))}
      </div>
      <div className="container" style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--color-bg-hover)", display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--color-text-muted)" }}>
        <span>2026 RESTObooking. Все права защищены.</span>
        <Link href="/privacy" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Политика конфиденциальности</Link>
      </div>
    </footer>
  );
}
