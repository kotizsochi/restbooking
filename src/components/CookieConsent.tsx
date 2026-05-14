"use client";

import { useState, useEffect } from "react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie_consent");
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: "var(--color-bg-card)", boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
      padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 16, flexWrap: "wrap",
      animation: "slideUp 0.4s ease-out",
    }}>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0, maxWidth: 600, lineHeight: 1.5 }}>
        Мы используем файлы cookie для улучшения работы сайта, аналитики посещаемости и персонализации контента.
        Продолжая использовать сайт, вы соглашаетесь с{" "}
        <a href="/privacy" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>
          политикой конфиденциальности
        </a>.
      </p>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={accept} className="btn btn-primary btn-sm" aria-label="Принять cookies">
          Принять
        </button>
        <button onClick={() => setVisible(false)} className="btn btn-ghost btn-sm" aria-label="Закрыть баннер">
          Закрыть
        </button>
      </div>
    </div>
  );
}
