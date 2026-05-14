"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Phone, MapPin, ChevronDown, Users, X, CheckCircle2,
  Clock, CalendarDays, List, LayoutGrid, UserPlus,
} from "lucide-react";

/* ---- helpers ---- */
function pad(n: number) { return String(n).padStart(2, "0"); }
function minutesToTime(m: number) { return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; }
function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }
function snap10(v: number) { return Math.round(v / 10) * 10; }

/* ---- mock data ---- */
const ZONES = ["Все залы", "Основной зал", "Веранда", "VIP"];

interface TableInfo {
  id: number; number: string; zone: string; seats: number;
  deposit: number; status: "free" | "busy" | "soon";
  busyUntil?: string; photo: string;
}

const TABLES: TableInfo[] = [
  { id: 1, number: "1", zone: "Основной зал", seats: 4, deposit: 0, status: "free", photo: "" },
  { id: 2, number: "5", zone: "Основной зал", seats: 8, deposit: 4000, status: "free", photo: "" },
  { id: 3, number: "10", zone: "Основной зал", seats: 2, deposit: 0, status: "busy", busyUntil: "20:30", photo: "" },
  { id: 4, number: "12", zone: "Основной зал", seats: 4, deposit: 0, status: "soon", busyUntil: "21:00", photo: "" },
  { id: 5, number: "17", zone: "Веранда", seats: 4, deposit: 0, status: "free", photo: "" },
  { id: 6, number: "20", zone: "Веранда", seats: 15, deposit: 6000, status: "free", photo: "" },
  { id: 7, number: "24", zone: "VIP", seats: 4, deposit: 0, status: "free", photo: "" },
  { id: 8, number: "3", zone: "Основной зал", seats: 4, deposit: 0, status: "busy", busyUntil: "22:00", photo: "" },
  { id: 9, number: "9", zone: "VIP", seats: 6, deposit: 3000, status: "free", photo: "" },
  { id: 10, number: "11", zone: "Веранда", seats: 4, deposit: 0, status: "busy", busyUntil: "22:30", photo: "" },
  { id: 11, number: "23", zone: "Основной зал", seats: 4, deposit: 0, status: "busy", busyUntil: "22:50", photo: "" },
  { id: 12, number: "13", zone: "Основной зал", seats: 4, deposit: 0, status: "busy", busyUntil: "23:00", photo: "" },
];

const TABLE_COLORS = ["#c24b5a", "#4a7c59", "#5b7ea8", "#8b6d47", "#7a5c8a", "#5a8f8f"];

/* ---- TimeSlider ---- */
function TimeSlider({ value, onChange, label, min = 720, max = 1440 }: {
  value: number; onChange: (v: number) => void; label: string; min?: number; max?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const posFromValue = (v: number) => ((v - min) / (max - min)) * 100;

  const valueFromPos = useCallback((clientX: number) => {
    if (!trackRef.current) return value;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = clamp((clientX - rect.left) / rect.width, 0, 1);
    return snap10(min + pct * (max - min));
  }, [min, max, value]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onChange(clamp(valueFromPos(e.clientX), min, max));
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    onChange(clamp(valueFromPos(e.clientX), min, max));
  };
  const onPointerUp = () => { dragging.current = false; };

  /* ticks every hour */
  const hours: number[] = [];
  for (let h = Math.ceil(min / 60); h <= Math.floor(max / 60); h++) hours.push(h);

  return (
    <div style={{ flex: 1 }}>
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{label}</span>
        <div style={{ fontSize: 20, fontWeight: 500, color: "#fff" }}>{minutesToTime(value)} ч.</div>
      </div>
      <div ref={trackRef} style={{ position: "relative", height: 32, cursor: "pointer", userSelect: "none" }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        {/* track */}
        <div style={{ position: "absolute", top: 14, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.15)" }} />
        {/* ticks */}
        {hours.map((h) => {
          const pct = posFromValue(h * 60);
          return (
            <div key={h} style={{ position: "absolute", left: `${pct}%`, top: 0, transform: "translateX(-50%)", textAlign: "center" }}>
              <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.2)", margin: "0 auto" }} />
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 14, whiteSpace: "nowrap" }}>{pad(h % 24)}:00</div>
            </div>
          );
        })}
        {/* 10-min minor ticks */}
        {Array.from({ length: Math.floor((max - min) / 10) + 1 }, (_, i) => min + i * 10).map((m) => {
          if (m % 60 === 0) return null;
          const pct = posFromValue(m);
          return <div key={m} style={{ position: "absolute", left: `${pct}%`, top: 8, width: 1, height: 6, background: "rgba(255,255,255,0.08)", transform: "translateX(-50%)" }} />;
        })}
        {/* thumb */}
        <div style={{
          position: "absolute", left: `${posFromValue(value)}%`, top: 6,
          width: 3, height: 18, background: "#fff", borderRadius: 2,
          transform: "translateX(-50%)", boxShadow: "0 0 6px rgba(255,255,255,0.3)",
          transition: dragging.current ? "none" : "left 0.1s ease",
        }} />
      </div>
    </div>
  );
}

/* ---- BookingForm modal ---- */
function BookingForm({ table, timeFrom, restaurantSlug, onClose }: { table: TableInfo; timeFrom: number; restaurantSlug: string; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(2);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name || !phone) return;
    setLoading(true);
    setError("");
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch("/api/trpc/booking.create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: {
            restaurantId: restaurantSlug,
            date: today,
            time: minutesToTime(timeFrom),
            guestCount: guests,
            guestName: name,
            guestPhone: phone.replace(/\D/g, ""),
            tableId: String(table.id),
            specialRequests: comment || undefined,
            source: "WIDGET" as const,
          },
        }),
      });
      const data = await res.json();
      if (data?.result?.data?.json?.id) {
        setBookingId(data.result.data.json.id);
      }
      setSent(true);
    } catch {
      setError("Ошибка при отправке. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 32, maxWidth: 400, width: "90%", textAlign: "center" }}>
        <CheckCircle2 size={48} style={{ color: "#2d8a5e", marginBottom: 12 }} />
        <h3 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8, color: "#1a1a1a" }}>Бронь отправлена!</h3>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>Столик #{table.number}, {minutesToTime(timeFrom)}</p>
        {bookingId && <p style={{ fontSize: 12, color: "#927555", marginBottom: 4 }}>ID: {bookingId}</p>}
        <p style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>Ожидайте подтверждение от ресторана</p>
        <button onClick={onClose} style={{ padding: "10px 32px", background: "#927555", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>OK</button>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 400, width: "90%", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer" }}><X size={20} color="#999" /></button>
        <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16, color: "#1a1a1a" }}>Забронировать столик #{table.number}</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <div style={{ padding: "6px 10px", background: "#f5f5f5", borderRadius: 6, fontSize: 13, color: "#333" }}>{table.zone}</div>
          <div style={{ padding: "6px 10px", background: "#f5f5f5", borderRadius: 6, fontSize: 13, color: "#333" }}>{table.seats} чел.</div>
          <div style={{ padding: "6px 10px", background: "#f5f5f5", borderRadius: 6, fontSize: 13, color: "#333" }}>{minutesToTime(timeFrom)}</div>
        </div>
        {table.deposit > 0 && <div style={{ padding: "8px 12px", background: "rgba(146,117,85,0.08)", borderRadius: 6, fontSize: 13, color: "#927555", marginBottom: 16 }}>Депозит: {table.deposit.toLocaleString("ru")} руб.</div>}
        {error && <div style={{ padding: "8px 12px", background: "rgba(220,53,69,0.08)", borderRadius: 6, fontSize: 13, color: "#dc3545", marginBottom: 12 }}>{error}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="Ваше имя *" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 14, outline: "none" }} />
          <input placeholder="+7 (___) ___-__-__" type="tel" value={phone || "+7"} onChange={(e) => {
            const raw = e.target.value;
            if (raw.length < 3) { setPhone("+7"); return; }
            const digits = raw.replace(/\D/g, "");
            const d = digits.startsWith("7") ? digits : "7" + digits;
            let r = "+7";
            if (d.length > 1) r += " (" + d.slice(1, 4);
            if (d.length >= 4) r += ")";
            if (d.length > 4) r += " " + d.slice(4, 7);
            if (d.length > 7) r += "-" + d.slice(7, 9);
            if (d.length > 9) r += "-" + d.slice(9, 11);
            setPhone(r);
          }} maxLength={18} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 14, outline: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#666" }}>Гостей:</span>
            <button onClick={() => setGuests(Math.max(1, guests - 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 16 }}>-</button>
            <span style={{ fontSize: 16, fontWeight: 500, minWidth: 20, textAlign: "center", color: "#1a1a1a" }}>{guests}</span>
            <button onClick={() => setGuests(Math.min(20, guests + 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 16 }}>+</button>
          </div>
          <textarea placeholder="Комментарий (необязательно)" value={comment} onChange={(e) => setComment(e.target.value)} rows={2} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 14, resize: "none", outline: "none" }} />
        </div>
        <button onClick={handleSubmit} disabled={!name || !phone || loading}
          style={{ width: "100%", marginTop: 16, padding: "12px", background: name && phone && !loading ? "#927555" : "#ccc", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: name && phone && !loading ? "pointer" : "not-allowed" }}>
          {loading ? "ОТПРАВКА..." : "ЗАБРОНИРОВАТЬ"}
        </button>
        <p style={{ fontSize: 11, color: "#999", textAlign: "center", marginTop: 8 }}>Сервис бронирования RESTObooking</p>
      </div>
    </div>
  );
}

/* ---- Main Widget ---- */
export default function WidgetPage() {
  const [timeFrom, setTimeFrom] = useState(1110); // 18:30
  const [timeTo, setTimeTo] = useState(0); // 0 = not set (single mode)
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [activeZone, setActiveZone] = useState("Все залы");
  const [view, setView] = useState<"list" | "map">("list");
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [sortBy, setSortBy] = useState<"occupancy" | "order">("occupancy");

  const toggleGroupMode = () => {
    if (!isGroupMode) {
      setTimeTo(Math.min(timeFrom + 120, 1440));
    } else {
      setTimeTo(0);
    }
    setIsGroupMode(!isGroupMode);
  };

  const filteredTables = TABLES.filter((t) => activeZone === "Все залы" || t.zone === activeZone)
    .sort((a, b) => {
      if (sortBy === "occupancy") {
        const order = { free: 0, soon: 1, busy: 2 };
        return order[a.status] - order[b.status];
      }
      return parseInt(a.number) - parseInt(b.number);
    });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", background: "#1a1a1d", borderRadius: 12, overflow: "hidden", fontFamily: "'Montserrat', sans-serif", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "12px 20px", background: "#222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, color: "#fff" }}>Белуга</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Москва, ул. Тверская, 15</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="tel:+78001234567" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
            <Phone size={12} /> 8 800 123-45-67
          </a>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>RU</span>
        </div>
      </div>

      {/* Group mode banner */}
      {isGroupMode && (
        <div style={{ background: "#2d8a5e", padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>ГРУППОВОЕ БРОНИРОВАНИЕ</span>
          <button onClick={toggleGroupMode} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={16} color="#fff" /></button>
        </div>
      )}

      {/* Time sliders */}
      <div style={{ padding: "16px 20px 8px", display: "flex", gap: isGroupMode ? 16 : 0 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>{isGroupMode ? "" : "Забронировать"}</span>
        </div>
        {!isGroupMode && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", position: "absolute", right: 20 }}>Сегодня</span>}
      </div>
      <div style={{ padding: "0 20px 12px", display: "flex", gap: isGroupMode ? 24 : 0 }}>
        <TimeSlider value={timeFrom} onChange={(v) => { setTimeFrom(v); if (isGroupMode && v >= timeTo) setTimeTo(Math.min(v + 60, 1440)); }} label={isGroupMode ? "с" : ""} min={720} max={1380} />
        {isGroupMode && <TimeSlider value={timeTo} onChange={(v) => setTimeTo(Math.max(v, timeFrom + 30))} label="до" min={720} max={1440} />}
      </div>

      {/* Zone filters */}
      <div style={{ padding: "0 20px 12px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {ZONES.map((z) => (
          <button key={z} onClick={() => setActiveZone(z)} style={{
            padding: "5px 12px", borderRadius: 14, fontSize: 12,
            background: activeZone === z ? "rgba(255,255,255,0.15)" : "transparent",
            color: activeZone === z ? "#fff" : "rgba(255,255,255,0.4)",
            border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
          }}>{z}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 4 }}>
          {([["occupancy", "По занятости"], ["order", "По порядку"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setSortBy(k)} style={{
              padding: "5px 10px", borderRadius: 14, fontSize: 11,
              background: sortBy === k ? "rgba(255,255,255,0.1)" : "transparent",
              color: sortBy === k ? "#fff" : "rgba(255,255,255,0.3)",
              border: "none", cursor: "pointer",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table grid */}
      {view === "list" && (
        <div style={{ padding: "0 20px 12px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
          {filteredTables.map((t) => {
            const isFree = t.status === "free";
            const isSoon = t.status === "soon";
            const colorIdx = (parseInt(t.number) - 1) % TABLE_COLORS.length;
            return (
              <div key={t.id} onClick={() => isFree && setSelectedTable(t)} style={{
                borderRadius: 8, overflow: "hidden", cursor: isFree ? "pointer" : "default",
                opacity: t.status === "busy" ? 0.5 : 1, position: "relative",
                transition: "transform 0.15s ease, opacity 0.15s ease",
              }}>
                {/* Photo placeholder */}
                <div style={{ height: 100, background: `linear-gradient(135deg, ${TABLE_COLORS[colorIdx]}88, ${TABLE_COLORS[colorIdx]}44)`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 32, fontWeight: 500, color: "rgba(255,255,255,0.15)" }}>#{t.number}</span>
                  {/* Status badge */}
                  <div style={{
                    position: "absolute", top: 6, left: 6, padding: "2px 8px",
                    borderRadius: 4, fontSize: 10, fontWeight: 500,
                    background: isFree ? "rgba(45,138,94,0.9)" : isSoon ? "rgba(243,156,18,0.9)" : "rgba(0,0,0,0.5)",
                    color: "#fff",
                  }}>
                    {isFree ? "Свободно" : isSoon ? `Свободно до ${t.busyUntil}` : `Занят до ${t.busyUntil}`}
                  </div>
                  {t.deposit > 0 && (
                    <div style={{ position: "absolute", top: 6, right: 6, padding: "2px 6px", borderRadius: 4, fontSize: 10, background: "rgba(146,117,85,0.9)", color: "#fff" }}>
                      {t.deposit.toLocaleString("ru")} руб.
                    </div>
                  )}
                  {isFree && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(45,138,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}>
                      <CheckCircle2 size={24} color="#fff" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div style={{ padding: "8px 10px", background: "#252528" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{t.zone}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>#{t.number} <span style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>стол</span></div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                      <Users size={12} /> {t.seats}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "map" && (
        <div style={{ padding: "0 20px 12px" }}>
          <div style={{ background: "#111", borderRadius: 8, padding: 20, minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
              <LayoutGrid size={48} style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 14 }}>Схема зала</p>
              <p style={{ fontSize: 11 }}>Интерактивная карта столов в разработке</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div style={{ padding: "8px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12 }}>
          {[["booking", "БРОНЬ"], ["events", "СОБЫТИЯ"], ["banquets", "БАНКЕТЫ"]].map(([k, l]) => (
            <button key={k} style={{ background: "none", border: "none", fontSize: 11, color: k === "booking" ? "var(--color-primary, #927555)" : "rgba(255,255,255,0.3)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              {k === "booking" && <CalendarDays size={12} />}
              {l}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {([["list", "СПИСОК"], ["map", "СХЕМА"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setView(k)} style={{
              padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500,
              background: view === k ? "#c24b5a" : "transparent",
              color: view === k ? "#fff" : "rgba(255,255,255,0.4)",
              border: view === k ? "none" : "1px solid rgba(255,255,255,0.15)", cursor: "pointer",
            }}>{l}</button>
          ))}
          <button onClick={toggleGroupMode} style={{
            padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500,
            background: isGroupMode ? "#2d8a5e" : "transparent",
            color: isGroupMode ? "#fff" : "rgba(255,255,255,0.4)",
            border: isGroupMode ? "none" : "1px solid rgba(255,255,255,0.15)", cursor: "pointer",
          }}>ГРУППА</button>
          <button style={{
            padding: "5px 12px", borderRadius: 4, fontSize: 11,
            background: "transparent", color: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer",
          }}>В ЛИСТ ОЖИДАНИЯ</button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "6px 20px 10px", textAlign: "center" }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Сервис бронирования RESTObooking</span>
      </div>

      {/* Booking modal */}
      {selectedTable && <BookingForm table={selectedTable} timeFrom={timeFrom} restaurantSlug="beluga" onClose={() => setSelectedTable(null)} />}
    </div>
  );
}
