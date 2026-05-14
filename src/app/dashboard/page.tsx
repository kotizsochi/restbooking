"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Building, CreditCard, Users, BarChart3, Settings, Plus,
  Search, ChevronRight, Clock, CheckCircle2, XCircle, Eye,
  Phone, Mail, Calendar, MapPin, Star, Bell, ArrowRight,
  TrendingUp, UserCheck, UserX, Filter, Trash2, Move, LayoutGrid,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTRPC } from "@/lib/trpc";
import { useQuery, useMutation } from "@tanstack/react-query";

type Tab = "venues" | "tariffs" | "staff" | "stats" | "settings";

const MOCK_BOOKINGS = [
  { id: 1, guest: "Александр М.", phone: "+7 900 123-45-67", guests: 6, time: "12:00", table: "A-2", status: "new" as const, tags: ["VIP", "День рождения"], comment: "Комментарий гостя до 100 символов" },
  { id: 2, guest: "Елена С.", phone: "+7 900 234-56-78", guests: 2, time: "14:00", table: "B-5", status: "confirmed" as const, tags: ["Вегетарианец"], comment: "" },
  { id: 3, guest: "Дмитрий К.", phone: "+7 900 345-67-89", guests: 4, time: "18:30", table: "C-1", status: "seated" as const, tags: ["Постоянный гость"], comment: "Столик у окна" },
  { id: 4, guest: "Мария В.", phone: "+7 900 456-78-90", guests: 3, time: "19:00", table: "A-4", status: "confirmed" as const, tags: [], comment: "" },
  { id: 5, guest: "Иван П.", phone: "+7 900 567-89-01", guests: 8, time: "20:00", table: "VIP-1", status: "new" as const, tags: ["Банкет"], comment: "Праздничный ужин" },
];

const STATUS_MAP = {
  new: { label: "Новый", color: "var(--color-warning)", bg: "rgba(243,156,18,0.1)" },
  confirmed: { label: "Подтвержден", color: "var(--color-primary)", bg: "rgba(139,109,71,0.1)" },
  seated: { label: "Пришел", color: "var(--color-success)", bg: "rgba(45,138,94,0.1)" },
  cancelled: { label: "Отмена", color: "var(--color-error)", bg: "rgba(220,53,69,0.1)" },
};

const STAFF = [
  { name: "Денис", email: "admin@restobooking.ru", role: "Создатель", registered: "14.05.2026" },
];

function DashHeader({ activeTab, setActiveTab, userName }: { activeTab: Tab; setActiveTab: (t: Tab) => void; userName: string }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "venues", label: "Заведения" },
    { key: "tariffs", label: "Тарифы и оплата" },
    { key: "staff", label: "Сотрудники" },
    { key: "stats", label: "Статистика" },
    { key: "settings", label: "Настройки" },
  ];
  return (
    <header style={{ background: "var(--color-bg-card)", boxShadow: "var(--shadow-sm)", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 56 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, color: "#fff" }}>R</div>
          <span style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", letterSpacing: 1 }}>RESTO<span style={{ color: "var(--color-primary)" }}>booking</span></span>
        </Link>
        <nav style={{ display: "flex", gap: 0 }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: "16px 16px", fontSize: 13, fontWeight: 400, cursor: "pointer",
              background: activeTab === t.key ? "var(--color-primary)" : "transparent",
              color: activeTab === t.key ? "#fff" : "var(--color-text-secondary)",
              border: "none", borderRadius: "var(--radius-sm)", transition: "all var(--transition-fast)",
            }}>{t.label}</button>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ThemeToggle />
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{userName}</span>
          <button onClick={() => signOut({ callbackUrl: "/login" })} style={{
            fontSize: 12, color: "var(--color-text-muted)", background: "none", border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)", padding: "4px 10px", cursor: "pointer", transition: "all var(--transition-fast)",
          }}>Выйти</button>
        </div>
      </div>
    </header>
  );
}

function VenuesTab() {
  const [filter, setFilter] = useState<"all" | "new" | "confirmed" | "seated" | "cancelled">("all");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [search, setSearch] = useState("");

  // Live data из PostgreSQL
  const trpc = useTRPC();
  const bookingsQuery = useQuery(trpc.booking.myRestaurantBookings.queryOptions());

  // Адаптер: преобразуем Prisma формат в UI формат
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allBookings = (bookingsQuery.data?.bookings || []).length > 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? bookingsQuery.data!.bookings.map((b: any, i: number) => ({
        id: b.id || i + 1,
        guest: b.user?.name || "Гость",
        phone: b.user?.phone || "",
        guests: b.guestCount || 2,
        time: b.time || "12:00",
        table: b.table?.label || "N/A",
        status: (b.status === "PENDING" ? "new" : b.status === "CONFIRMED" ? "confirmed" : b.status === "SEATED" ? "seated" : b.status === "CANCELLED" ? "cancelled" : "new") as "new" | "confirmed" | "seated" | "cancelled",
        tags: [] as string[],
        comment: b.specialRequests || "",
      }))
    : MOCK_BOOKINGS;

  const restaurantName = bookingsQuery.data?.restaurant?.name || "Белуга";
  const restaurantSlug = bookingsQuery.data?.restaurant?.slug || "beluga";
  const restaurantCity = bookingsQuery.data?.restaurant?.city || "Москва";

  const filtered = allBookings.filter((b) => {
    if (filter !== "all" && b.status !== filter) return false;
    if (search && !b.guest.toLowerCase().includes(search.toLowerCase()) && !b.phone.includes(search)) return false;
    return true;
  });
  const today = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  const counts = { new: allBookings.filter(b => b.status === "new").length, confirmed: allBookings.filter(b => b.status === "confirmed").length, seated: allBookings.filter(b => b.status === "seated").length };

  return (
    <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: selectedBooking ? "220px 1fr 320px" : "220px 1fr", minHeight: "calc(100vh - 56px)", transition: "all 0.3s ease" }}>
      {/* Sidebar */}
      <aside className="dashboard-sidebar" style={{ background: "var(--color-bg-card)", padding: 16, boxShadow: "var(--shadow-sm)" }}>
        <h4 style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-muted)", letterSpacing: "0.1em", marginBottom: 12 }}>ЗАВЕДЕНИЯ</h4>
        <div style={{ padding: "10px 12px", background: "var(--color-primary)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 500 }}>{restaurantName}</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>{restaurantCity}</div>
          </div>
          <span style={{ fontSize: 10, padding: "2px 6px", background: "rgba(255,255,255,0.2)", borderRadius: 4 }}>PRO+</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--color-primary)", marginBottom: 16 }}>14 дней тестового периода</div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}>
          <Plus size={14} /> Новый адрес
        </button>
      </aside>

      {/* Main content */}
      <main style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 500 }}>{restaurantName}</h2>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Виджет: <span style={{ color: "var(--color-primary)" }}>{restaurantSlug}.restobooking.ru</span></p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm" style={{ gap: 4 }}><Settings size={14} /> Настройки</button>
            <button className="btn btn-primary btn-sm" style={{ gap: 4 }}>Виджет для сайта</button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
          <input className="input-field" placeholder="Номер телефона или имя гостя" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "1px solid var(--color-border)" }}>
          {([["all", "Все заявки", null], ["new", "Новые", counts.new], ["confirmed", "Ожидаем", counts.confirmed], ["seated", "Открыто", counts.seated], ["cancelled", "Закрытие", 0]] as const).map(([key, label, count]) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: "10px 16px", fontSize: 12, fontWeight: filter === key ? 500 : 400, cursor: "pointer",
              background: "none", border: "none", borderBottom: filter === key ? "2px solid var(--color-primary)" : "2px solid transparent",
              color: filter === key ? "var(--color-primary)" : "var(--color-text-secondary)",
            }}>
              {label} {count !== null && count > 0 && <span style={{ marginLeft: 4, padding: "1px 6px", borderRadius: 8, background: key === "new" ? "var(--color-warning)" : "var(--color-primary)", color: "#fff", fontSize: 10 }}>{count}</span>}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 12 }}>Сегодня, {today}</div>

        {/* Booking list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((b) => {
            const st = STATUS_MAP[b.status];
            const isActive = selectedBooking?.id === b.id;
            return (
              <div key={b.id} onClick={() => setSelectedBooking(isActive ? null : b)} style={{
                padding: "14px 16px", background: isActive ? "var(--color-bg-elevated)" : "var(--color-bg-card)",
                borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-xs)",
                display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
                borderLeft: isActive ? "3px solid var(--color-primary)" : "3px solid transparent",
                transition: "all var(--transition-fast)",
              }}>
                <div style={{ minWidth: 50, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{b.time}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>ст. {b.table}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{b.guest}</span>
                    <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{b.guests} чел.</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{b.phone}</div>
                  {b.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                      {b.tags.map((tag) => (
                        <span key={tag} className="feature-tag" style={{ fontSize: 10 }}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" style={{ padding: 6 }}><Phone size={14} /></button>
                  <button className="btn btn-ghost btn-sm" style={{ padding: 6 }}><CheckCircle2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Detail panel */}
      {selectedBooking && (() => {
        const b = selectedBooking;
        const st = STATUS_MAP[b.status as keyof typeof STATUS_MAP];
        return (
          <aside style={{ background: "var(--color-bg-card)", borderLeft: "1px solid var(--color-border)", padding: 20, overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 500 }}>СТОЛ #{b.table}</h3>
              <button onClick={() => setSelectedBooking(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}><XCircle size={18} /></button>
            </div>

            <div style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", background: st.bg, color: st.color, fontSize: 13, fontWeight: 500, marginBottom: 16, textAlign: "center" }}>
              {st.label}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{b.guest}</div>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 4 }}><Phone size={12} /> {b.phone}</div>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>{b.guests} чел., {b.time}</div>
            </div>

            {b.tags.length > 0 && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
                {b.tags.map((tag: string) => <span key={tag} className="feature-tag">{tag}</span>)}
              </div>
            )}

            {b.comment && <div style={{ padding: 12, background: "var(--color-bg-elevated)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>{b.comment}</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {b.status === "new" && (
                <button className="btn btn-primary" style={{ width: "100%", gap: 6, justifyContent: "center" }}>
                  <CheckCircle2 size={16} /> Подтвердить бронь
                </button>
              )}
              {(b.status === "new" || b.status === "confirmed") && (
                <button className="btn btn-primary" style={{ width: "100%", gap: 6, justifyContent: "center", background: "var(--color-success)" }}>
                  <UserCheck size={16} /> Открыть (сели гости)
                </button>
              )}
              {b.status === "seated" && (
                <button className="btn btn-secondary" style={{ width: "100%", gap: 6, justifyContent: "center" }}>
                  <Clock size={16} /> Закрыть визит
                </button>
              )}
              <button className="btn btn-ghost" style={{ width: "100%", gap: 6, justifyContent: "center", color: "var(--color-error)" }}>
                <XCircle size={16} /> Отменить
              </button>
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 8 }}>ИСТОРИЯ</div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}><span style={{ color: "var(--color-text-muted)" }}>18:15</span> Заявка создана</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}><span style={{ color: "var(--color-text-muted)" }}>18:16</span> SMS уведомление отправлено</div>
              </div>
            </div>

            <div style={{ marginTop: 16, padding: 12, background: "var(--color-bg-elevated)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--color-text-muted)", textAlign: "center" }}>
              Пока открыта форма, гости не смогут забронировать "Стол"
            </div>
          </aside>
        );
      })()}
    </div>
  );
}

function TariffsTab() {
  const [period, setPeriod] = useState("1m");
  const periods = [{ k: "1y", l: "1 год - 12%" }, { k: "6m", l: "6 мес - 6%" }, { k: "3m", l: "3 месяца" }, { k: "1m", l: "1 месяц" }];
  const multiplier = period === "1y" ? 0.88 : period === "6m" ? 0.94 : period === "3m" ? 1 : 1;
  const tariffs = [
    { name: "Free", base: 0, features: ["До 300 заявок в мес", "Книга резервов", "Виджет для сайта", "Уведомления SMS и TG", "Интеграция с Я.Еда"] },
    { name: "Mini", base: 2550, features: ["Заявки без ограничений", "Книга резервов и схема зала", "Форма бронирования", "Лист ожидания (очередь)", "Банкеты", "Уведомления гостям", "Сервисы аналитики"] },
    { name: "PRO", base: 4310, features: ["Все из Mini, плюс:", "Депозиты на ваш р/с", "Звонки с облачными АТС", "Статистика заведения", "База гостей и черный список", "Полная история резервов"], highlighted: true },
    { name: "PRO +", base: 5190, features: ["Все из PRO, плюс:", "Выключение лейбла", "Продажа билетов", "Сертификаты", "Промокоды на скидку", "Интеграции с POS: iiko, r_keeper", "Интеграции с CRM: Битрикс24", "API RESTObooking"] },
  ];

  return (
    <div style={{ padding: 32, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ padding: "16px 20px", background: "var(--color-bg-card)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)", marginBottom: 24, textAlign: "center" }}>
        <p style={{ fontWeight: 500 }}>Тестовый период до 28.05.2026</p>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Автоплатеж отключен</p>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
        {periods.map((p) => (
          <button key={p.k} className={`time-slot ${period === p.k ? "active" : ""}`} style={{ padding: "8px 16px", fontSize: 12 }} onClick={() => setPeriod(p.k)}>{p.l}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {tariffs.map((t) => {
          const price = t.base === 0 ? 0 : Math.round(t.base * multiplier);
          return (
            <div key={t.name} style={{ padding: 20, background: "var(--color-bg-card)", borderRadius: "var(--radius-md)", boxShadow: t.highlighted ? "var(--shadow-lg)" : "var(--shadow-sm)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 500, color: t.highlighted ? "var(--color-primary)" : "var(--color-text-primary)", marginBottom: 4 }}>{t.name}</h3>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 22, fontWeight: 500 }}>{price === 0 ? "Бесплатно" : `${price.toLocaleString("ru")} руб`}</span>
                {price > 0 && <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>/мес</span>}
              </div>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {t.features.map((f) => (
                  <li key={f} style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 5 }}>
                    <CheckCircle2 size={12} style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: 2 }} />{f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 20, padding: 16, background: "var(--color-bg-card)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Оплата по карте или по счету (для юр. лиц и ИП) в своем личном кабинете</p>
      </div>
    </div>
  );
}

function StaffTab() {
  return (
    <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 56px)" }}>
      <aside style={{ background: "var(--color-bg-card)", padding: 16 }}>
        <h4 style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-muted)", letterSpacing: "0.1em", marginBottom: 12 }}>СОТРУДНИКИ</h4>
        <button style={{ fontSize: 13, color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", marginBottom: 8 }}>Все сотрудники</button>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", cursor: "pointer" }}>Белуга</div>
      </aside>
      <main style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
            <input className="input-field" placeholder="Введите Имя / E-mail" style={{ paddingLeft: 36 }} />
          </div>
          <button className="btn btn-primary btn-sm" style={{ gap: 4, borderRadius: "50%", width: 36, height: 36, padding: 0 }}><Plus size={18} /></button>
        </div>
        {STAFF.map((s) => (
          <div key={s.email} style={{ padding: 16, background: "var(--color-bg-card)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-xs)", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 500 }}>{s.name[0]}</div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</span> <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>это вы</span>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{s.email}</div>
            </div>
            <span style={{ fontSize: 12, color: "var(--color-primary)", fontWeight: 500 }}>{s.role}</span>
          </div>
        ))}
      </main>
    </div>
  );
}

function StatsTab() {
  const metrics = [
    { label: "Всего посещений", value: "47", sub: "с 01.05.26", trend: "+12%" },
    { label: "Всего броней", value: "52", sub: "100% от посещений", trend: "+8%" },
    { label: "Новые брони", value: "38", sub: "73% от броней", trend: "+15%" },
    { label: "Повторные брони", value: "14", sub: "27% от броней", trend: "+3%" },
    { label: "Отмененные", value: "5", sub: "9% от броней", trend: "-2%" },
  ];
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const dayValues = [12, 8, 15, 20, 28, 45, 35];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: "calc(100vh - 56px)" }}>
      <aside style={{ background: "var(--color-bg-card)", padding: 16 }}>
        <h4 style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-muted)", letterSpacing: "0.1em", marginBottom: 12 }}>БРОНИРОВАНИЯ</h4>
        {["Сводка", "Статистика заведений", "История заявок"].map((item, i) => (
          <div key={item} style={{ fontSize: 13, color: i === 0 ? "var(--color-primary)" : "var(--color-text-secondary)", padding: "6px 0", cursor: "pointer" }}>{item}</div>
        ))}
        <h4 style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-muted)", letterSpacing: "0.1em", marginTop: 16, marginBottom: 12 }}>ГОСТИ</h4>
        {["База гостей"].map((item) => (
          <div key={item} style={{ fontSize: 13, color: "var(--color-text-secondary)", padding: "6px 0", cursor: "pointer" }}>{item}</div>
        ))}
      </aside>
      <main style={{ padding: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 20 }}>Сводка</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ padding: 16, background: "var(--color-bg-card)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-xs)" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 24, fontWeight: 500 }}>{m.value}</div>
              <div style={{ fontSize: 11, color: m.trend.startsWith("+") ? "var(--color-success)" : "var(--color-error)" }}>{m.trend} <span style={{ color: "var(--color-text-muted)" }}>{m.sub}</span></div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginBottom: 24 }}>
          <div style={{ padding: 20, background: "var(--color-bg-card)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-xs)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>Посещаемость</h3>
            <div style={{ height: 160, display: "flex", alignItems: "flex-end", gap: 4, paddingBottom: 24, position: "relative" }}>
              {[5, 8, 12, 15, 10, 22, 18, 25, 20, 30, 28, 35, 32, 40].map((v, i) => (
                <div key={i} style={{ flex: 1, background: "var(--color-primary)", borderRadius: "2px 2px 0 0", height: `${(v / 40) * 100}%`, opacity: 0.7, transition: "height var(--transition-base)" }} />
              ))}
            </div>
          </div>
          <div style={{ padding: 20, background: "var(--color-bg-card)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-xs)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>По дням недели</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {days.map((d, i) => (
                <div key={d} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, width: 20, color: "var(--color-text-muted)" }}>{d}</span>
                  <div style={{ flex: 1, height: 16, background: "var(--color-bg-elevated)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(dayValues[i] / 50) * 100}%`, background: i >= 5 ? "var(--color-primary)" : "var(--color-bg-hover)", borderRadius: 3, transition: "width var(--transition-base)" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--color-text-muted)", width: 24 }}>{dayValues[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ padding: 20, background: "var(--color-bg-card)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-xs)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Среднее время посещений</h3>
            <div style={{ fontSize: 28, fontWeight: 500 }}>47 мин</div>
          </div>
          <div style={{ padding: 20, background: "var(--color-bg-card)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-xs)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Среднее время ожидания</h3>
            <div style={{ fontSize: 28, fontWeight: 500 }}>3 мин</div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface EditorTable { id: string; label: string; x: number; y: number; type: string; seats: number; shape: "circle" | "rect" }

function NotificationsList() {
  const trpc = useTRPC();
  const settingsQuery = useQuery(trpc.notification.getSettings.queryOptions());
  const toggleMut = useMutation(trpc.notification.toggleChannel.mutationOptions({
    onSuccess: () => settingsQuery.refetch(),
  }));

  const channels = settingsQuery.data?.channels || [
    { key: "sms_new_booking", label: "SMS о новом бронировании", desc: "Гость получит SMS с подтверждением", enabled: true, channel: "sms" as const },
    { key: "tg_new_booking", label: "Telegram уведомление", desc: "Мгновенное оповещение бота в чат ресторана", enabled: true, channel: "telegram" as const },
    { key: "sms_reminder", label: "Напоминание за 2 часа", desc: "Напомнить гостю о бронировании", enabled: false, channel: "sms" as const },
    { key: "email_review", label: "Запрос отзыва", desc: "На следующий день после визита", enabled: false, channel: "email" as const },
    { key: "email_confirm", label: "Email подтверждение", desc: "Дублировать подтверждение на почту", enabled: false, channel: "email" as const },
  ];

  return (
    <>
      {channels.map((n, i) => (
        <div key={n.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < channels.length - 1 ? "1px solid var(--color-border)" : "none" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 400 }}>{n.label}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{n.desc}</div>
          </div>
          <div
            onClick={() => toggleMut.mutate({ key: n.key, enabled: !n.enabled })}
            style={{
              width: 44, height: 24, borderRadius: 12,
              background: n.enabled ? "var(--color-primary)" : "var(--color-bg-elevated)",
              cursor: toggleMut.isPending ? "wait" : "pointer",
              position: "relative", transition: "background 0.2s",
              opacity: toggleMut.isPending ? 0.6 : 1,
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: "50%", background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              position: "absolute", top: 2, left: n.enabled ? 22 : 2, transition: "left 0.2s",
            }} />
          </div>
        </div>
      ))}
    </>
  );
}

function SettingsTab() {
  const [section, setSection] = useState<"floor" | "widget" | "notifications">("floor");
  const trpc = useTRPC();

  // Загружаем столы из API
  const layoutQuery = useQuery(trpc.floor.getLayout.queryOptions({ hallId: undefined }));
  const saveLayoutMut = useMutation(
    trpc.floor.saveLayout.mutationOptions({
      onSuccess: () => setSaveStatus("saved"),
      onError: () => setSaveStatus("error"),
    })
  );

  const [tables, setTables] = useState<EditorTable[]>([
    { id: "t1", label: "1", x: 80, y: 80, type: "STANDARD", seats: 4, shape: "rect" },
    { id: "t2", label: "2", x: 240, y: 80, type: "STANDARD", seats: 2, shape: "circle" },
    { id: "t3", label: "VIP", x: 160, y: 200, type: "VIP", seats: 8, shape: "rect" },
    { id: "t4", label: "3", x: 80, y: 200, type: "STANDARD", seats: 4, shape: "circle" },
    { id: "t5", label: "Бар", x: 300, y: 200, type: "BAR", seats: 2, shape: "circle" },
  ]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [tablesLoaded, setTablesLoaded] = useState(false);

  // Синхронизация с сервером при загрузке
  if (layoutQuery.data && !tablesLoaded) {
    const serverTables = layoutQuery.data.tables;
    if (serverTables.length > 0) {
      setTables(serverTables.map((t: { id: string; label: string; x: number; y: number; type: string; seats: number; shape: string }) => ({ ...t, shape: (t.shape as "circle" | "rect") || "rect" })));
    }
    setTablesLoaded(true);
  }
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedEditor, setSelectedEditor] = useState<string | null>(null);
  const [widgetTheme, setWidgetTheme] = useState("dark");
  const [widgetColor, setWidgetColor] = useState("#8B6D47");
  const [widgetBtnText, setWidgetBtnText] = useState("Забронировать");

  const handleSvgMouseDown = (e: React.MouseEvent<SVGElement>, id: string) => {
    const svg = (e.currentTarget as SVGElement).closest("svg");
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const svgP = pt.matrixTransform(ctm.inverse());
    const table = tables.find(t => t.id === id);
    if (!table) return;
    setDragging(id);
    setDragOffset({ x: svgP.x - table.x, y: svgP.y - table.y });
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const svgP = pt.matrixTransform(ctm.inverse());
    setTables(prev => prev.map(t => t.id === dragging ? { ...t, x: Math.max(30, Math.min(470, svgP.x - dragOffset.x)), y: Math.max(30, Math.min(370, svgP.y - dragOffset.y)) } : t));
  };

  const addTable = () => {
    const id = `t${Date.now()}`;
    setTables(prev => [...prev, { id, label: `${prev.length + 1}`, x: 200, y: 150, type: "STANDARD", seats: 4, shape: "rect" }]);
  };

  const removeTable = (id: string) => setTables(prev => prev.filter(t => t.id !== id));

  const sections = [
    { key: "floor" as const, label: "Схема зала", icon: LayoutGrid },
    { key: "widget" as const, label: "Виджет", icon: Eye },
    { key: "notifications" as const, label: "Уведомления", icon: Bell },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: "calc(100vh - 56px)" }}>
      <aside style={{ background: "var(--color-bg-card)", padding: 16, boxShadow: "var(--shadow-sm)" }}>
        {sections.map(s => {
          const Icon = s.icon;
          return (
            <button key={s.key} onClick={() => setSection(s.key)} style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 12px",
              background: section === s.key ? "rgba(139,109,71,0.08)" : "transparent",
              border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer",
              color: section === s.key ? "var(--color-primary)" : "var(--color-text-secondary)",
              fontSize: 13, fontWeight: section === s.key ? 500 : 400, marginBottom: 4,
            }}><Icon size={16} /> {s.label}</button>
          );
        })}
      </aside>

      <main style={{ padding: 32 }}>
        {section === "floor" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 500 }}>Конструктор зала</h2>
                <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Перетаскивайте столы для настройки схемы</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={addTable} style={{ gap: 4 }}><Plus size={14} /> Добавить стол</button>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={saveLayoutMut.isPending}
                  onClick={() => {
                    setSaveStatus("idle");
                    saveLayoutMut.mutate({
                      hallId: layoutQuery.data?.hallId || "demo-hall",
                      tables: tables.map(({ id, ...rest }) => ({ ...rest, id, type: rest.type as "STANDARD" | "VIP" | "BAR" | "TERRACE" | "PRIVATE" | "LOUNGE" })),
                    });
                  }}
                >
                  {saveLayoutMut.isPending ? "Сохранение..." : saveStatus === "saved" ? "Сохранено" : "Сохранить"}
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20 }}>
              {/* SVG Canvas */}
              <div style={{ background: "var(--color-bg-card)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
                <svg viewBox="0 0 500 400" style={{ width: "100%", height: "auto", cursor: dragging ? "grabbing" : "default" }}
                  onMouseMove={handleSvgMouseMove}
                  onMouseUp={() => setDragging(null)}
                  onMouseLeave={() => setDragging(null)}
                >
                  <defs>
                    <pattern id="editor-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.4" />
                    </pattern>
                  </defs>
                  <rect width="500" height="400" fill="url(#editor-grid)" />

                  {/* Entrance */}
                  <g transform="translate(220, 380)">
                    <rect width="60" height="16" rx="3" fill="none" stroke="var(--color-text-muted)" strokeWidth="1" strokeDasharray="4" />
                    <text x="30" y="12" textAnchor="middle" fill="var(--color-text-muted)" fontSize="9">Вход</text>
                  </g>

                  {tables.map(t => {
                    const isSelected = selectedEditor === t.id;
                    const fill = t.type === "VIP" ? "rgba(200,169,126,0.2)" : "rgba(139,109,71,0.1)";
                    const stroke = isSelected ? "var(--color-primary)" : "var(--color-border)";
                    return (
                      <g key={t.id} transform={`translate(${t.x}, ${t.y})`} style={{ cursor: "grab" }}
                        onMouseDown={(e) => { handleSvgMouseDown(e, t.id); setSelectedEditor(t.id); }}
                      >
                        {t.shape === "rect"
                          ? <rect x="-28" y="-18" width="56" height="36" rx="4" fill={fill} stroke={stroke} strokeWidth={isSelected ? 2 : 1} />
                          : <circle cx="0" cy="0" r="22" fill={fill} stroke={stroke} strokeWidth={isSelected ? 2 : 1} />
                        }
                        {Array.from({ length: Math.min(t.seats, 8) }).map((_, i) => {
                          const a = (i / Math.min(t.seats, 8)) * Math.PI * 2 - Math.PI / 2;
                          return <circle key={i} cx={Math.cos(a) * 36} cy={Math.sin(a) * 36} r="4" fill="var(--color-bg-secondary)" stroke="var(--color-border)" strokeWidth="0.5" />;
                        })}
                        <text x="0" y="1" textAnchor="middle" dominantBaseline="middle" fill="var(--color-text-primary)" fontSize="11" fontWeight="500">{t.label}</text>
                        <text x="0" y="14" textAnchor="middle" fill="var(--color-text-muted)" fontSize="8">{t.seats} мест</text>
                        {t.type === "VIP" && (
                          <g transform="translate(18,-16)"><rect x="-10" y="-5" width="20" height="10" rx="3" fill="var(--color-primary)" /><text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="600">VIP</text></g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Properties panel */}
              <div style={{ background: "var(--color-bg-card)", borderRadius: "var(--radius-lg)", padding: 16, boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Столы ({tables.length})</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {tables.map(t => (
                    <div key={t.id} onClick={() => setSelectedEditor(t.id)} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 10px", borderRadius: "var(--radius-sm)", cursor: "pointer",
                      background: selectedEditor === t.id ? "rgba(139,109,71,0.08)" : "transparent",
                      border: selectedEditor === t.id ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>Стол {t.label}</div>
                        <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{t.type} / {t.seats} мест</div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); removeTable(t.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-error)", padding: 4 }}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>

                {selectedEditor && (() => {
                  const t = tables.find(x => x.id === selectedEditor);
                  if (!t) return null;
                  return (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 8 }}>РЕДАКТИРОВАНИЕ</div>
                      <div style={{ marginBottom: 8 }}>
                        <label style={{ fontSize: 11, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Название</label>
                        <input className="input-field" value={t.label} onChange={e => setTables(prev => prev.map(x => x.id === t.id ? { ...x, label: e.target.value } : x))} style={{ fontSize: 13 }} />
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <label style={{ fontSize: 11, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Мест</label>
                        <input type="number" className="input-field" value={t.seats} min={1} max={20} onChange={e => setTables(prev => prev.map(x => x.id === t.id ? { ...x, seats: Number(e.target.value) } : x))} style={{ fontSize: 13 }} />
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <label style={{ fontSize: 11, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Тип</label>
                        <select className="input-field" value={t.type} onChange={e => setTables(prev => prev.map(x => x.id === t.id ? { ...x, type: e.target.value } : x))} style={{ fontSize: 13 }}>
                          <option value="STANDARD">Стандарт</option>
                          <option value="VIP">VIP</option>
                          <option value="BAR">Бар</option>
                          <option value="OUTDOOR">Терраса</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Форма</label>
                        <div style={{ display: "flex", gap: 8 }}>
                          {(["rect", "circle"] as const).map(s => (
                            <button key={s} onClick={() => setTables(prev => prev.map(x => x.id === t.id ? { ...x, shape: s } : x))} style={{
                              flex: 1, padding: "6px", border: `1px solid ${t.shape === s ? "var(--color-primary)" : "var(--color-border)"}`,
                              borderRadius: "var(--radius-sm)", background: t.shape === s ? "rgba(139,109,71,0.08)" : "transparent",
                              cursor: "pointer", fontSize: 12, color: "var(--color-text-primary)",
                            }}>{s === "rect" ? "Прямоуг." : "Круглый"}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </>
        )}

        {section === "widget" && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 20 }}>Настройки виджета</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
              <div style={{ background: "var(--color-bg-card)", borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow-sm)" }}>
                <div style={{ marginBottom: 20 }}>
                  <label className="input-label">Тема виджета</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["dark", "light"].map(th => (
                      <button key={th} onClick={() => setWidgetTheme(th)} style={{
                        flex: 1, padding: 12, border: `1px solid ${widgetTheme === th ? "var(--color-primary)" : "var(--color-border)"}`,
                        borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: 13,
                        background: th === "dark" ? "#1a1a1a" : "#fff", color: th === "dark" ? "#fff" : "#333",
                      }}>{th === "dark" ? "Темная" : "Светлая"}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label className="input-label">Акцентный цвет</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={widgetColor} onChange={e => setWidgetColor(e.target.value)} style={{ width: 40, height: 40, border: "none", cursor: "pointer", borderRadius: "var(--radius-sm)" }} />
                    <input className="input-field" value={widgetColor} onChange={e => setWidgetColor(e.target.value)} style={{ flex: 1, fontSize: 13 }} />
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label className="input-label">Текст кнопки</label>
                  <input className="input-field" value={widgetBtnText} onChange={e => setWidgetBtnText(e.target.value)} />
                </div>
                <div>
                  <label className="input-label">Код для встраивания</label>
                  <div style={{ padding: 12, background: "var(--color-bg-elevated)", borderRadius: "var(--radius-sm)", fontFamily: "monospace", fontSize: 11, color: "var(--color-text-secondary)", wordBreak: "break-all" }}>
                    {`<script src="https://restobooking.ru/widget.js" data-restaurant="beluga" data-theme="${widgetTheme}" data-color="${widgetColor}"></script>`}
                  </div>
                </div>
              </div>
              {/* Preview */}
              <div style={{ background: widgetTheme === "dark" ? "#1a1a1a" : "#f5f5f5", borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-sm)" }}>
                <div style={{ fontSize: 11, color: widgetTheme === "dark" ? "#666" : "#999", marginBottom: 8, textAlign: "center" }}>ПРЕДПРОСМОТР</div>
                <div style={{ padding: 16, background: widgetTheme === "dark" ? "#222" : "#fff", borderRadius: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: widgetTheme === "dark" ? "#fff" : "#333", marginBottom: 12 }}>Забронировать</div>
                  <div style={{ height: 36, background: widgetTheme === "dark" ? "#333" : "#f0f0f0", borderRadius: 8, marginBottom: 8 }} />
                  <div style={{ height: 36, background: widgetTheme === "dark" ? "#333" : "#f0f0f0", borderRadius: 8, marginBottom: 12 }} />
                  <button style={{ width: "100%", padding: "10px", background: widgetColor, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>{widgetBtnText}</button>
                  <div style={{ fontSize: 9, color: widgetTheme === "dark" ? "#555" : "#bbb", textAlign: "center", marginTop: 8 }}>RESTObooking</div>
                </div>
              </div>
            </div>
          </>
        )}

        {section === "notifications" && (() => {
          const notifQuery = layoutQuery; // Реиспользуем для статуса загрузки
          void notifQuery; // suppress unused
          return (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 20 }}>Уведомления</h2>
              <div style={{ background: "var(--color-bg-card)", borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow-sm)", maxWidth: 600 }}>
                <NotificationsList />
              </div>
            </>
          );
        })()}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("venues");
  const { data: session } = useSession();
  const userName = session?.user?.name || "Пользователь";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)" }}>
      <DashHeader activeTab={activeTab} setActiveTab={setActiveTab} userName={userName} />
      {activeTab === "venues" && <VenuesTab />}
      {activeTab === "tariffs" && <TariffsTab />}
      {activeTab === "staff" && <StaffTab />}
      {activeTab === "stats" && <StatsTab />}
      {activeTab === "settings" && <SettingsTab />}
    </div>
  );
}
