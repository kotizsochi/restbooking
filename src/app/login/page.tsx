"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Building } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("429") || result.error.includes("rate") || result.status === 429) {
          setError("Слишком много попыток входа. Подождите минуту и попробуйте снова.");
        } else {
          setError("Неверный email или пароль");
        }
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Ошибка соединения с сервером. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
      }}
    >
      {/* Theme toggle */}
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <ThemeToggle />
      </div>

      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "var(--radius-md)",
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 600,
                color: "#fff",
              }}
            >
              R
            </div>
            <span
              style={{
                fontSize: 24,
                fontWeight: 500,
                color: "var(--color-text-primary)",
                letterSpacing: 1,
              }}
            >
              RESTO
              <span style={{ color: "var(--color-primary)" }}>booking</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--color-bg-card)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            padding: 32,
            border: "1px solid var(--color-border)",
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 500,
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            Вход в личный кабинет
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-muted)",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Управляйте бронированиями вашего ресторана
          </p>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(220,53,69,0.08)",
                border: "1px solid rgba(220,53,69,0.2)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-error)",
                fontSize: 13,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} aria-label="Форма входа">
            <div style={{ marginBottom: 16 }}>
              <label
                className="input-label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <Mail size={14} /> Email
              </label>
              <input
                id="login-email"
                className="input-field"
                type="email"
                placeholder="admin@restobooking.ru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                aria-label="Email адрес"
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                className="input-label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <Lock size={14} /> Пароль
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  className="input-field"
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 44 }}
                  aria-label="Пароль"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-muted)",
                    padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                justifyContent: "center",
                gap: 8,
                padding: "12px 20px",
                fontSize: 14,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Вход..." : "Войти"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div style={{ textAlign: "right", marginTop: 8 }}>
            <button type="button" onClick={() => alert("Функция восстановления пароля будет доступна в ближайшем обновлении. Обратитесь в поддержку: support@restobooking.ru")} style={{
              fontSize: 12, color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0,
            }}>
              Забыли пароль?
            </button>
          </div>

          {/* Demo credentials */}
          <div
            style={{
              marginTop: 20,
              padding: 14,
              background: "var(--color-bg-elevated)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                marginBottom: 6,
                fontWeight: 500,
                letterSpacing: "0.05em",
              }}
            >
              ДЕМО-ДОСТУП
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
              <div>
                Email:{" "}
                <span
                  style={{
                    fontFamily: "monospace",
                    color: "var(--color-primary)",
                  }}
                >
                  admin@restobooking.ru
                </span>
              </div>
              <div>
                Пароль:{" "}
                <span
                  style={{
                    fontFamily: "monospace",
                    color: "var(--color-primary)",
                  }}
                >
                  demo2026
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 16,
            fontSize: 13,
          }}
        >
          <Link
            href="/"
            style={{
              color: "var(--color-text-muted)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            На главную
          </Link>
          <Link
            href="/for-restaurants"
            style={{
              color: "var(--color-primary)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Building size={14} /> Подключить ресторан
          </Link>
        </div>
      </div>
    </div>
  );
}
