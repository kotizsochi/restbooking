"use client";

import { useState, useMemo } from "react";
import {
  Search, MapPin, Users, Calendar, Star, ChevronRight, Clock,
  Utensils, Wine, Shield, SlidersHorizontal, X,
  BookOpen, Bell, CreditCard, Smartphone, Plug, BarChart3,
  ArrowRight, CheckCircle2,
} from "lucide-react";
import { MOCK_RESTAURANTS } from "@/lib/mock-data";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

const CITIES = ["Все города", "Москва", "Санкт-Петербург", "Сочи"];
const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const CUISINE_LABELS: Record<string, string> = {
  RUSSIAN: "Русская", ITALIAN: "Итальянская", JAPANESE: "Японская",
  CHINESE: "Китайская", GEORGIAN: "Грузинская", FRENCH: "Французская",
  AMERICAN: "Американская", SEAFOOD: "Морепродукты", STEAKHOUSE: "Стейкхаус",
  FUSION: "Фьюжн", OTHER: "Другое",
};

const PRICE_LABELS: Record<string, { label: string; symbols: number }> = {
  BUDGET: { label: "Бюджетный", symbols: 1 },
  MODERATE: { label: "Средний", symbols: 2 },
  PREMIUM: { label: "Премиум", symbols: 3 },
  LUXURY: { label: "Люкс", symbols: 4 },
};

const ALL_CUISINES = [...new Set(MOCK_RESTAURANTS.flatMap((r) => r.cuisine))];
const ALL_PRICES = ["BUDGET", "MODERATE", "PREMIUM", "LUXURY"];

function PriceIndicator({ range }: { range: string }) {
  const info = PRICE_LABELS[range] || PRICE_LABELS.MODERATE;
  return (
    <span className="price-indicator" title={info.label}>
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className={i <= info.symbols ? "active-symbol" : "inactive-symbol"}>{"$"}</span>
      ))}
    </span>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="rating-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} fill={i <= Math.round(rating) ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

function Header() {
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
            REST<span style={{ color: "var(--color-primary)" }}>Booking</span>
          </span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/for-restaurants" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>Для ресторанов</Link>
          <ThemeToggle />
          <Link href="/dashboard" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>Войти</Link>
        </nav>
      </div>
    </header>
  );
}

function HeroSection({ onSearch }: { onSearch: (city: string) => void }) {
  const [city, setCity] = useState("Москва");
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });

  return (
    <section style={{ position: "relative", padding: "clamp(60px, 12vw, 120px) 0 clamp(40px, 8vw, 80px)", textAlign: "center", overflow: "hidden" }}>
      {/* Video Background */}
      <video autoPlay muted loop playsInline style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
        objectFit: "cover", zIndex: 0,
      }}>
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
        background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.7) 100%)",
        zIndex: 1,
      }} />

      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <h1 className="font-display animate-fade-in" style={{
          fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 500,
          marginBottom: 16, lineHeight: 1.05, color: "#fff",
        }}>
          Забронируйте столик<br />
          <span style={{ color: "var(--color-primary)" }}>в лучших ресторанах</span>
        </h1>
        <p className="animate-fade-in" style={{
          fontSize: "clamp(14px, 2vw, 18px)", color: "rgba(255,255,255,0.7)",
          maxWidth: 500, margin: "0 auto 32px", animationDelay: "0.1s",
        }}>
          Реальная доступность, мгновенное подтверждение, интеграция с CRM ресторанов
        </p>

        <div className="glass-card animate-slide-up" style={{
          display: "flex", gap: 12, padding: "clamp(12px, 2vw, 16px)",
          maxWidth: 720, margin: "0 auto", flexWrap: "wrap", animationDelay: "0.2s",
          background: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}>
          <div style={{ flex: "1 1 130px", minWidth: 120 }}>
            <label className="input-label" style={{ color: "rgba(255,255,255,0.7)" }}><MapPin size={11} style={{ display: "inline", marginRight: 4 }} />Город</label>
            <select className="input-field" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }} value={city} onChange={(e) => { setCity(e.target.value); onSearch(e.target.value); }}>
              {CITIES.map((c) => <option key={c} value={c} style={{ color: "#000" }}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 130px", minWidth: 120 }}>
            <label className="input-label" style={{ color: "rgba(255,255,255,0.7)" }}><Calendar size={11} style={{ display: "inline", marginRight: 4 }} />Дата</label>
            <input type="date" className="input-field" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }} value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
          </div>
          <div style={{ flex: "1 1 100px", minWidth: 90 }}>
            <label className="input-label" style={{ color: "rgba(255,255,255,0.7)" }}><Users size={11} style={{ display: "inline", marginRight: 4 }} />Гости</label>
            <select className="input-field" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }} value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
              {GUEST_OPTIONS.map((g) => <option key={g} value={g} style={{ color: "#000" }}>{g} {g === 1 ? "гость" : g < 5 ? "гостя" : "гостей"}</option>)}
            </select>
          </div>
          <div style={{ flex: "0 0 auto", display: "flex", alignItems: "flex-end" }}>
            <button className="btn btn-primary btn-lg" style={{ gap: 6 }}>
              <Search size={18} /> Найти
            </button>
          </div>
        </div>

        <div className="animate-fade-in" style={{
          display: "flex", justifyContent: "center", gap: "clamp(16px, 3vw, 32px)",
          marginTop: 24, animationDelay: "0.4s", flexWrap: "wrap",
        }}>
          {[
            { icon: Clock, text: "Мгновенное подтверждение" },
            { icon: Shield, text: "Гарантия брони" },
            { icon: Utensils, text: "500+ ресторанов" },
          ].map(({ icon: Icon, text }) => (
            <span key={text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
              <Icon size={14} style={{ color: "var(--color-primary)" }} /> {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Filters({
  cuisineFilter, setCuisineFilter,
  priceFilter, setPriceFilter,
  ratingFilter, setRatingFilter,
}: {
  cuisineFilter: string[];
  setCuisineFilter: (v: string[]) => void;
  priceFilter: string[];
  setPriceFilter: (v: string[]) => void;
  ratingFilter: number;
  setRatingFilter: (v: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeCount = cuisineFilter.length + priceFilter.length + (ratingFilter > 0 ? 1 : 0);

  return (
    <div style={{ marginBottom: 20 }}>
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => setOpen(!open)}
        style={{ gap: 6 }}
      >
        <SlidersHorizontal size={14} />
        Фильтры
        {activeCount > 0 && (
          <span className="badge badge-gold" style={{ marginLeft: 4, padding: "2px 6px", fontSize: 10 }}>
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-scale-in" style={{
          marginTop: 12, padding: "16px 20px",
          background: "var(--color-bg-card)", borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-md)",
        }}>
          {/* Cuisine */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Кухня
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {ALL_CUISINES.map((c) => (
                <button key={c}
                  className={`time-slot ${cuisineFilter.includes(c) ? "active" : ""}`}
                  style={{ padding: "6px 12px", fontSize: 12, minWidth: "auto" }}
                  onClick={() => {
                    setCuisineFilter(
                      cuisineFilter.includes(c)
                        ? cuisineFilter.filter((x) => x !== c)
                        : [...cuisineFilter, c]
                    );
                  }}>
                  {CUISINE_LABELS[c] || c}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Ценовая категория
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {ALL_PRICES.map((p) => (
                <button key={p}
                  className={`time-slot ${priceFilter.includes(p) ? "active" : ""}`}
                  style={{ padding: "6px 12px", fontSize: 12, minWidth: "auto" }}
                  onClick={() => {
                    setPriceFilter(
                      priceFilter.includes(p)
                        ? priceFilter.filter((x) => x !== p)
                        : [...priceFilter, p]
                    );
                  }}>
                  {PRICE_LABELS[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Рейтинг от
            </span>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {[0, 4.0, 4.3, 4.5, 4.8].map((r) => (
                <button key={r}
                  className={`time-slot ${ratingFilter === r ? "active" : ""}`}
                  style={{ padding: "6px 12px", fontSize: 12, minWidth: "auto" }}
                  onClick={() => setRatingFilter(r)}>
                  {r === 0 ? "Все" : `${r}+`}
                </button>
              ))}
            </div>
          </div>

          {activeCount > 0 && (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, gap: 4, color: "var(--color-error)" }}
              onClick={() => { setCuisineFilter([]); setPriceFilter([]); setRatingFilter(0); }}>
              <X size={12} /> Сбросить фильтры
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function RestaurantCard({ restaurant }: { restaurant: typeof MOCK_RESTAURANTS[number] }) {
  return (
    <Link href={`/restaurant/${restaurant.slug}`} style={{ textDecoration: "none" }}>
      <div className="card" style={{ cursor: "pointer" }}>
        <div style={{
          height: "clamp(140px, 20vw, 200px)",
          position: "relative", overflow: "hidden",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={restaurant.coverImage} alt={restaurant.name} loading="lazy" style={{
            width: "100%", height: "100%", objectFit: "cover",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
          {restaurant.depositRequired && (
            <span className="badge badge-gold" style={{ position: "absolute", top: 12, right: 12 }}>Депозит</span>
          )}
        </div>
        <div style={{ padding: "clamp(14px, 2vw, 20px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <h3 style={{ fontSize: "clamp(15px, 2vw, 18px)", fontWeight: 500 }}>{restaurant.name}</h3>
            <PriceIndicator range={restaurant.priceRange} />
          </div>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 10, lineHeight: 1.4 }}>{restaurant.shortDesc}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <RatingStars rating={restaurant.avgRating} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-primary)" }}>{restaurant.avgRating}</span>
            <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>({restaurant.reviewCount})</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
            {restaurant.cuisine.map((c) => (
              <span key={c} className="feature-tag">{CUISINE_LABELS[c] || c}</span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={11} /> {restaurant.city}
            </span>
            <ChevronRight size={14} style={{ color: "var(--color-primary)" }} />
          </div>
        </div>
      </div>
    </Link>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: BookOpen,
      title: "Электронная книга резервов",
      desc: "Все бронирования в одном месте. Управляйте потоком гостей в реальном времени",
    },
    {
      icon: Smartphone,
      title: "Приложение для хостес",
      desc: "Мобильный интерфейс для быстрого управления посадкой и статусами броней",
    },
    {
      icon: CreditCard,
      title: "Депозиты онлайн",
      desc: "Автоматический расчет и прием депозитов. Снижение no-show на 40%",
    },
    {
      icon: Plug,
      title: "Интеграции с CRM",
      desc: "Подключение к iiko, r_keeper, SmartReserve и другим системам",
    },
    {
      icon: Bell,
      title: "Уведомления гостям",
      desc: "SMS, push и Telegram уведомления о подтверждении и напоминания",
    },
    {
      icon: BarChart3,
      title: "Аналитика",
      desc: "Загрузка, доходимость, средний чек, источники бронирований",
    },
  ];

  return (
    <section style={{ padding: "clamp(40px, 8vw, 80px) 0", background: "var(--color-bg-secondary)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 500, marginBottom: 12 }}>
            Все для управления бронированиями
          </h2>
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", maxWidth: 480, margin: "0 auto" }}>
            Полноценная платформа для ресторанов и гостей
          </p>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}>
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} style={{
                padding: 24, borderRadius: "var(--radius-lg)",
                background: "var(--color-bg-card)", boxShadow: "var(--shadow-sm)",
                transition: "all var(--transition-base)",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "var(--radius-md)",
                  background: "rgba(139, 109, 71, 0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}>
                  <Icon size={20} style={{ color: "var(--color-primary)" }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{feat.title}</h3>
                <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link href="/for-restaurants" className="btn btn-primary btn-lg" style={{ textDecoration: "none", gap: 8 }}>
            Подключить ресторан <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
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
            <span style={{ fontSize: 15, fontWeight: 500 }}>REST<span style={{ color: "var(--color-primary)" }}>Booking</span></span>
          </div>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", maxWidth: 260 }}>
            Сервис бронирования и книга резервов для ресторанов
          </p>
        </div>
        {[
          { title: "ГОСТЯМ", links: ["Рестораны", "Акции", "Приложение"] },
          { title: "РЕСТОРАНАМ", links: ["Подключение", "Тарифы", "API"] },
          { title: "КОМПАНИЯ", links: ["О нас", "Контакты", "Блог"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 style={{ fontSize: 11, fontWeight: 500, marginBottom: 12, color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>{col.title}</h4>
            {col.links.map((link) => (
              <a key={link} href="#" style={{ display: "block", fontSize: 13, color: "var(--color-text-secondary)", textDecoration: "none", marginBottom: 8, transition: "color var(--transition-fast)" }}>{link}</a>
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
}

export default function HomePage() {
  const [filteredCity, setFilteredCity] = useState("Москва");
  const [cuisineFilter, setCuisineFilter] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState(0);

  const restaurants = useMemo(() => {
    return MOCK_RESTAURANTS.filter((r) => {
      if (filteredCity !== "Все города" && r.city !== filteredCity) return false;
      if (cuisineFilter.length > 0 && !r.cuisine.some((c) => cuisineFilter.includes(c))) return false;
      if (priceFilter.length > 0 && !priceFilter.includes(r.priceRange)) return false;
      if (ratingFilter > 0 && r.avgRating < ratingFilter) return false;
      return true;
    });
  }, [filteredCity, cuisineFilter, priceFilter, ratingFilter]);

  return (
    <>
      <Header />
      <main>
        <HeroSection onSearch={(city) => setFilteredCity(city)} />
        <section className="container" style={{ paddingBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 500 }}>
              Рестораны {filteredCity !== "Все города" && <>в городе <span style={{ color: "var(--color-primary)" }}>{filteredCity}</span></>}
            </h2>
            <span style={{ fontSize: 14, color: "var(--color-text-muted)" }}>{restaurants.length} заведений</span>
          </div>

          <Filters
            cuisineFilter={cuisineFilter} setCuisineFilter={setCuisineFilter}
            priceFilter={priceFilter} setPriceFilter={setPriceFilter}
            ratingFilter={ratingFilter} setRatingFilter={setRatingFilter}
          />

          <div className="stagger-children" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
            gap: "clamp(16px, 2vw, 24px)",
          }}>
            {restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
          {restaurants.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: "var(--color-text-muted)" }}>
              <Utensils size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <p>Нет ресторанов по выбранным фильтрам</p>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}
                onClick={() => { setCuisineFilter([]); setPriceFilter([]); setRatingFilter(0); }}>
                Сбросить фильтры
              </button>
            </div>
          )}
        </section>
        <FeaturesSection />
      </main>
      <Footer />
    </>
  );
}
