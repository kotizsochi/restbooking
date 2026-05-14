"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen, Bell, CreditCard, Smartphone, Plug, BarChart3,
  ArrowRight, ArrowLeft, CheckCircle2, Globe,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PhoneMaskedInput } from "@/components/PhoneMaskedInput";

const FEATURES = [
  { icon: BookOpen, title: "Электронная книга резервов", desc: "Все бронирования в реальном времени с автообновлением.", details: ["Календарь на день/неделю/месяц", "Статусы броней", "История визитов гостя"] },
  { icon: Globe, title: "Онлайн прием броней", desc: "Виджет бронирования на вашем сайте. 24/7 без участия персонала.", details: ["Встраиваемый виджет", "Страница на RESTObooking", "Автоподтверждение"] },
  { icon: CreditCard, title: "Депозиты онлайн", desc: "Снижение no-show до 5%. Автоматический расчет депозитов.", details: ["Гибкая настройка суммы", "Пиковые надбавки", "Возврат при отмене"] },
  { icon: Smartphone, title: "Приложение для хостес", desc: "Мобильный интерфейс для управления посадкой.", details: ["Карта столов", "Быстрый чек-ин", "Push-уведомления"] },
  { icon: Plug, title: "Интеграции CRM", desc: "Двусторонняя синхронизация с вашей POS-системой.", details: ["iiko, r_keeper, SmartReserve", "Webhook и REST API", "Автосинхронизация"] },
  { icon: Bell, title: "Уведомления гостям", desc: "Автоматические напоминания. SMS, push, Telegram.", details: ["Подтверждение брони", "Напоминание за 2ч", "Обратная связь"] },
];

const TARIFFS = [
  { name: "Free", price: "0", period: "навсегда", desc: "Бесплатно", features: ["До 300 заявок в мес", "Книга резервов для хостес", "Виджет для сайта", "Уведомления по SMS и TG", "Интеграция с Я.Еда"], cta: "Начать бесплатно", highlighted: false },
  { name: "Mini", price: "2 550", period: "руб/мес", desc: "за 1 заведение", features: ["Заявки без ограничений", "Книга резервов и схема зала", "Форма бронирования", "Лист ожидания (очередь)", "Банкеты", "Сервисы аналитики"], cta: "Попробовать 14 дней", highlighted: false },
  { name: "PRO", price: "4 310", period: "руб/мес", desc: "за 1 заведение", features: ["Все из Mini, плюс:", "Депозиты без комиссии", "Звонки с облачными АТС", "Статистика заведения", "База гостей и черный список", "Полная история резервов"], cta: "Попробовать 14 дней", highlighted: true },
  { name: "PRO +", price: "5 190", period: "руб/мес", desc: "за 1 заведение", features: ["Все из PRO, плюс:", "Выключение лейбла", "Продажа билетов", "Сертификаты и промокоды", "Интеграции с POS: iiko, r_keeper", "Интеграции с CRM: Битрикс24, AmoCRM", "API RESTObooking"], cta: "Попробовать 14 дней", highlighted: false },
];

const DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
const SLOT_STEPS = ["30 мин.", "1 ч.", "1 ч. 30 м.", "2 ч."];

type RegStep = 1 | 2 | 3 | 4 | 5;

interface DaySchedule { enabled: boolean; open: string; close: string; }

function RegistrationForm() {
  const [step, setStep] = useState<RegStep>(1);
  const [form, setForm] = useState({
    ownerName: "", email: "", password: "", phone: "",
    restaurantName: "", city: "", address: "", restaurantPhone: "",
    tableCount: "10", hourlyBooking: false, slotStep: "1 ч. 30 м.",
    cuisine: "", agreed: false,
  });
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS.map(() => ({ enabled: true, open: "10:00", close: "23:00" }))
  );

  const update = (field: string, value: string | boolean) => setForm((p) => ({ ...p, [field]: value }));
  const updateDay = (i: number, patch: Partial<DaySchedule>) => {
    setSchedule((prev) => prev.map((d, idx) => idx === i ? { ...d, ...patch } : d));
  };
  const applyToAll = () => {
    const first = schedule[0];
    setSchedule(DAYS.map(() => ({ ...first })));
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", background: "var(--color-bg-card)", borderRadius: "var(--radius-xl)", padding: "clamp(24px, 4vw, 40px)", boxShadow: "var(--shadow-lg)" }}>
      {step < 5 && (
        <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? "var(--color-primary)" : "var(--color-bg-elevated)", transition: "background var(--transition-base)" }} />
          ))}
        </div>
      )}

      {/* Step 1: Account */}
      {step === 1 && (<>
        <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Регистрация заведения</h3>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 24 }}>Рекомендуем регистрировать аккаунт на владельца или официальный email заведения</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div><label className="input-label">Ваше имя *</label><input className="input-field" placeholder="Иван Иванов" value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} /></div>
          <div><label className="input-label">E-mail *</label><input className="input-field" type="email" placeholder="info@restaurant.ru" value={form.email} onChange={(e) => update("email", e.target.value)} /></div>
          <div><label className="input-label">Пароль *</label><input className="input-field" type="password" placeholder="Минимум 8 символов" value={form.password} onChange={(e) => update("password", e.target.value)} /></div>
          <div><label className="input-label">Телефон *</label><PhoneMaskedInput value={form.phone} onChange={(v) => update("phone", v)} /></div>
        </div>
        <label style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--color-text-secondary)", cursor: "pointer", marginTop: 16, alignItems: "flex-start" }}>
          <input type="checkbox" checked={form.agreed} onChange={(e) => update("agreed", e.target.checked)} style={{ marginTop: 2, accentColor: "var(--color-primary)" }} />
          <span>Я даю согласие на обработку персональных данных и принимаю условия оферты</span>
        </label>
        <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 20, gap: 8 }} disabled={!form.ownerName || !form.email || !form.password || !form.phone || !form.agreed} onClick={() => setStep(2)}>
          Далее <ArrowRight size={16} />
        </button>
      </>)}

      {/* Step 2: Restaurant Info */}
      {step === 2 && (<>
        <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Создание книги резерва</h3>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 24 }}>Информация о заведении</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div><label className="input-label">Название заведения *</label><input className="input-field" placeholder="Белуга" value={form.restaurantName} onChange={(e) => update("restaurantName", e.target.value)} /></div>
          <div><label className="input-label">Город заведения *</label><input className="input-field" placeholder="Москва" value={form.city} onChange={(e) => update("city", e.target.value)} /></div>
          <div><label className="input-label">Адрес заведения (улица, дом) *</label><input className="input-field" placeholder="ул. Тверская, 15" value={form.address} onChange={(e) => update("address", e.target.value)} /></div>
          <div><label className="input-label">Телефон заведения *</label><PhoneMaskedInput value={form.restaurantPhone} onChange={(v) => update("restaurantPhone", v)} /></div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button className="btn btn-secondary" style={{ flex: 1, gap: 6 }} onClick={() => setStep(1)}><ArrowLeft size={14} /> Назад</button>
          <button className="btn btn-primary" style={{ flex: 2, gap: 6 }} disabled={!form.restaurantName || !form.city || !form.address || !form.restaurantPhone} onClick={() => setStep(3)}>Время работы <ArrowRight size={14} /></button>
        </div>
      </>)}

      {/* Step 3: Schedule per day */}
      {step === 3 && (<>
        <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Время работы</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Часовой пояс: (UTC +03:00) Москва</p>
          <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={applyToAll}>Применить ко всем</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DAYS.map((day, i) => (
            <div key={day} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 110, cursor: "pointer", fontSize: 14 }}>
                <input type="checkbox" checked={schedule[i].enabled} onChange={(e) => updateDay(i, { enabled: e.target.checked })} style={{ accentColor: "var(--color-primary)" }} />
                {day.slice(0, 2)}
              </label>
              <input type="time" className="input-field" style={{ width: 100, padding: "6px 8px", fontSize: 13 }} value={schedule[i].open} onChange={(e) => updateDay(i, { open: e.target.value })} disabled={!schedule[i].enabled} />
              <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}> - </span>
              <input type="time" className="input-field" style={{ width: 100, padding: "6px 8px", fontSize: 13 }} value={schedule[i].close} onChange={(e) => updateDay(i, { close: e.target.value })} disabled={!schedule[i].enabled} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button className="btn btn-secondary" style={{ flex: 1, gap: 6 }} onClick={() => setStep(2)}><ArrowLeft size={14} /> Назад</button>
          <button className="btn btn-primary" style={{ flex: 2, gap: 6 }} onClick={() => setStep(4)}>Последний шаг <ArrowRight size={14} /></button>
        </div>
      </>)}

      {/* Step 4: Tables & Booking Settings */}
      {step === 4 && (<>
        <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Настройка бронирования</h3>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 24 }}>В Редакторе вы сможете изменить все параметры объектов бронирования и залов</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div><label className="input-label">Количество (столов, комнат и т.д.) *</label><input className="input-field" type="number" min="1" max="200" value={form.tableCount} onChange={(e) => update("tableCount", e.target.value)} /></div>
          <div style={{ padding: 16, background: "var(--color-bg-elevated)", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 500 }}>Почасовое бронирование</span>
                <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>Гости смогут бронировать на определенное количество часов</p>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: 44, height: 24, cursor: "pointer" }}>
                <input type="checkbox" checked={form.hourlyBooking} onChange={(e) => update("hourlyBooking", e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: "absolute", inset: 0, borderRadius: 12, background: form.hourlyBooking ? "var(--color-primary)" : "var(--color-bg-hover)", transition: "background var(--transition-fast)" }}>
                  <span style={{ position: "absolute", top: 2, left: form.hourlyBooking ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "var(--shadow-xs)", transition: "left var(--transition-fast)" }} />
                </span>
              </label>
            </div>
          </div>
          <div>
            <label className="input-label">Шаг времени бронирования</label>
            <select className="input-field" value={form.slotStep} onChange={(e) => update("slotStep", e.target.value)}>
              {SLOT_STEPS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button className="btn btn-secondary" style={{ flex: 1, gap: 6 }} onClick={() => setStep(3)}><ArrowLeft size={14} /> Назад</button>
          <button className="btn btn-primary" style={{ flex: 2, gap: 6 }} disabled={!form.tableCount} onClick={() => setStep(5)}>Создать заведение <ArrowRight size={14} /></button>
        </div>
      </>)}

      {/* Step 5: Success + Trial */}
      {step === 5 && (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(45, 138, 94, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckCircle2 size={36} style={{ color: "var(--color-success)" }} />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Заведение создано!</h3>
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 8 }}>{form.restaurantName}, {form.city}</p>
          <div style={{ padding: "12px 16px", background: "rgba(139, 109, 71, 0.06)", borderRadius: "var(--radius-md)", marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Активирован тарифный план PRO+<br />на 14 дней бесплатно</p>
            <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>По истечении пробного периода ваш тарифный план переключится на бесплатный тариф Старт</p>
          </div>
          <Link href="/dashboard" className="btn btn-primary btn-lg" style={{ width: "100%", textDecoration: "none", gap: 8 }}>
            OK <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ForRestaurantsPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <header className="glass-card" style={{ position: "sticky", top: 0, zIndex: 50, borderRadius: 0 }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 500, color: "#fff" }}>R</div>
            <span style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)" }}>RESTO<span style={{ color: "var(--color-primary)" }}>Booking</span></span>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ThemeToggle />
            <Link href="/" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>Для гостей</Link>
          </nav>
        </div>
      </header>

      <section style={{ padding: "clamp(48px, 8vw, 80px) 0 40px", textAlign: "center" }}>
        <div className="container">
          <span className="badge badge-gold animate-fade-in" style={{ marginBottom: 16, padding: "6px 14px", fontSize: 12, display: "inline-block" }}>Для ресторанов</span>
          <h1 className="font-display animate-fade-in" style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 500, marginBottom: 16, lineHeight: 1.1 }}>
            Сервис бронирования<br />и книга резервов
          </h1>
          <p className="animate-fade-in" style={{ fontSize: "clamp(14px, 2vw, 17px)", color: "var(--color-text-secondary)", maxWidth: 500, margin: "0 auto 28px" }}>
            Электронная книга резервов, онлайн прием броней, депозиты и интеграции с iiko, r_keeper
          </p>
          <div className="animate-fade-in" style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <a href="#register" className="btn btn-primary btn-lg" style={{ textDecoration: "none", gap: 8 }}>Подключиться бесплатно <ArrowRight size={18} /></a>
            <a href="#features" className="btn btn-secondary btn-lg" style={{ textDecoration: "none" }}>Возможности</a>
          </div>
        </div>
      </section>

      <section style={{ padding: "28px 0", background: "var(--color-bg-secondary)" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 16, textAlign: "center" }}>
          {[{ v: "500+", l: "ресторанов" }, { v: "50K+", l: "броней/мес" }, { v: "94%", l: "доходимость" }, { v: "4.8", l: "рейтинг" }].map((s) => (
            <div key={s.l}><div style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 500, color: "var(--color-primary)" }}>{s.v}</div><div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{s.l}</div></div>
          ))}
        </div>
      </section>

      <section id="features" style={{ padding: "clamp(48px, 8vw, 72px) 0" }}>
        <div className="container">
          <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 500, marginBottom: 32, textAlign: "center" }}>Все инструменты для бронирований</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 16 }}>
            {FEATURES.map((f) => { const Icon = f.icon; return (
              <div key={f.title} style={{ padding: "clamp(16px, 3vw, 24px)", borderRadius: "var(--radius-lg)", background: "var(--color-bg-card)", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "rgba(139,109,71,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}><Icon size={20} style={{ color: "var(--color-primary)" }} /></div>
                <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 12, lineHeight: 1.5 }}>{f.desc}</p>
                <ul style={{ listStyle: "none", padding: 0 }}>{f.details.map((d) => (<li key={d} style={{ fontSize: 12, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><CheckCircle2 size={12} style={{ color: "var(--color-primary)", flexShrink: 0 }} />{d}</li>))}</ul>
              </div>
            ); })}
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(48px, 8vw, 72px) 0", background: "var(--color-bg-secondary)" }}>
        <div className="container">
          <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 500, marginBottom: 32, textAlign: "center" }}>Тарифы</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16, alignItems: "start" }}>
            {TARIFFS.map((t) => (
              <div key={t.name} style={{ padding: "clamp(20px, 3vw, 28px)", borderRadius: "var(--radius-lg)", background: "var(--color-bg-card)", boxShadow: t.highlighted ? "var(--shadow-lg)" : "var(--shadow-sm)", position: "relative", transform: t.highlighted ? "scale(1.02)" : "none" }}>
                {t.highlighted && <span className="badge badge-gold" style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", padding: "4px 12px", fontSize: 11 }}>Популярный</span>}
                <h3 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>{t.name}</h3>
                <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 14 }}>{t.desc}</p>
                <div style={{ marginBottom: 16 }}><span style={{ fontSize: 28, fontWeight: 500 }}>{t.price}</span><span style={{ fontSize: 14, color: "var(--color-text-muted)", marginLeft: 4 }}>{t.price !== "0" && "\u20BD"} {t.period}</span></div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 20 }}>{t.features.map((f) => (<li key={f} style={{ fontSize: 13, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><CheckCircle2 size={13} style={{ color: "var(--color-primary)", flexShrink: 0 }} />{f}</li>))}</ul>
                <a href="#register" className={`btn ${t.highlighted ? "btn-primary" : "btn-secondary"} btn-lg`} style={{ width: "100%", textDecoration: "none" }}>{t.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="register" style={{ padding: "clamp(48px, 8vw, 72px) 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 500, marginBottom: 8 }}>Подключите ресторан</h2>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Создайте книгу резерва за 3 минуты. Бесплатно.</p>
          </div>
          <RegistrationForm />
        </div>
      </section>

      <footer style={{ padding: "28px 0", background: "var(--color-bg-secondary)", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>RESTObooking 2026. Сервис бронирования и книга резервов.</p>
      </footer>
    </div>
  );
}
