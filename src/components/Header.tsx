"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const { data: session } = useSession();
  return (
    <header className="glass-card header-separator" style={{
      position: "sticky", top: 0, zIndex: 50, borderRadius: 0,
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "var(--radius-md)",
            background: "var(--color-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 500, color: "#ffffff",
          }}>R</div>
          <span style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>
            RESTO<span style={{ color: "var(--color-primary)" }}>booking</span>
          </span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 8 }} aria-label="Main navigation">
          <Link href="/for-restaurants" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>Для ресторанов</Link>
          <ThemeToggle />
          {session ? (
            <Link href="/dashboard" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>Личный кабинет</Link>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>Войти</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
