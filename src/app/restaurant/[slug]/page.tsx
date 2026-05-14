"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Star, MapPin, Clock, Users, Calendar,
  Phone, Globe, Wine, ChevronDown, Check, AlertCircle,
  Utensils, Music, Car, Eye, Waves, Heart, List, LayoutGrid,
} from "lucide-react";
import { MOCK_RESTAURANTS, getAvailableSlots } from "@/lib/mock-data";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PhoneMaskedInput } from "@/components/PhoneMaskedInput";
import { FloorPlan } from "@/components/FloorPlan";
import { useTRPC } from "@/lib/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";

const CUISINE_LABELS: Record<string, string> = {
  RUSSIAN: "Русская", ITALIAN: "Итальянская", JAPANESE: "Японская",
  GEORGIAN: "Грузинская", FRENCH: "Французская", SEAFOOD: "Морепродукты",
  STEAKHOUSE: "Стейкхаус", FUSION: "Фьюжн",
};

const FEATURE_ICONS: Record<string, { icon: typeof Wine; label: string }> = {
  vip: { icon: Star, label: "VIP-зоны" },
  terrace: { icon: Waves, label: "Терраса" },
  live_music: { icon: Music, label: "Живая музыка" },
  parking: { icon: Car, label: "Парковка" },
  private_room: { icon: Eye, label: "Приватный зал" },
  sea_view: { icon: Eye, label: "Вид на море" },
  wine_cellar: { icon: Wine, label: "Винный погреб" },
  tasting_menu: { icon: Utensils, label: "Дегустационное меню" },
  wine_pairing: { icon: Wine, label: "Винная карта" },
  family_friendly: { icon: Heart, label: "Семейный" },
  sushi_bar: { icon: Utensils, label: "Суши-бар" },
  outdoor_seating: { icon: Waves, label: "Веранда" },
  group_events: { icon: Users, label: "Банкеты" },
  sake_collection: { icon: Wine, label: "Коллекция сакэ" },
  private_events: { icon: Star, label: "Закрытые мероприятия" },
  wine_list: { icon: Wine, label: "Винная карта" },
};

const TABLE_TYPE_LABELS: Record<string, string> = {
  STANDARD: "Стандартный", VIP: "VIP", BAR: "Бар",
  TERRACE: "Терраса", PRIVATE: "Приватный", LOUNGE: "Лаунж",
};

type BookingStep = "select" | "confirm" | "success";

export default function RestaurantPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Live data из PostgreSQL, fallback на mock
  const trpc = useTRPC();
  const restaurantQuery = useQuery(trpc.restaurant.getBySlug.queryOptions({ slug }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const restaurant: any = restaurantQuery.data ?? MOCK_RESTAURANTS.find((r) => r.slug === slug) ?? null;

  const [guestCount, setGuestCount] = useState(2);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableView, setTableView] = useState<"list" | "map">("list");
  const [bookingStep, setBookingStep] = useState<BookingStep>("select");
  const [specialRequests, setSpecialRequests] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingId, setBookingId] = useState("");


  const createBooking = useMutation(
    trpc.booking.create.mutationOptions({
      onSuccess: (data) => {
        if (data?.id) setBookingId(String(data.id));
        setBookingStep("success");
      },
      onError: () => {
        setBookingError("Ошибка при бронировании. Попробуйте ещё раз.");
      },
    })
  );

  // UX-08: Получаем занятые слоты из БД
  const occupiedQuery = useQuery(
    trpc.booking.getOccupiedSlots.queryOptions(
      { restaurantId: restaurant?.id || "", date: selectedDate },
      { enabled: !!restaurant?.id }
    )
  );
  const occupiedSlots = occupiedQuery.data?.occupied || [];

  const availableSlots = useMemo(() => {
    if (!restaurant) return [];
    const slots = getAvailableSlots(restaurant.id, selectedDate, guestCount);
    // Помечаем слоты с максимальной загрузкой (все столы заняты)
    return slots.map(slot => {
      const occupiedTablesAtTime = occupiedSlots
        .filter(o => o.time === slot.time)
        .map(o => o.tableId);
      const freeTablesCount = slot.tables.filter(
        t => !occupiedTablesAtTime.includes(t.id)
      ).length;
      return { ...slot, freeTablesCount, fullyBooked: freeTablesCount === 0 };
    });
  }, [restaurant, selectedDate, guestCount, occupiedSlots]);

  const selectedSlot = availableSlots.find((s) => s.time === selectedTime);
  const depositAmount = restaurant?.depositRequired
    ? (restaurant.depositAmount || 0) * (selectedSlot?.isPeak ? 1.5 : 1)
    : 0;

  if (restaurantQuery.isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid var(--color-border)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "var(--color-text-muted)" }}>Загрузка ресторана...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <AlertCircle size={48} style={{ color: "var(--color-error)", marginBottom: 16 }} />
          <h2 style={{ marginBottom: 8 }}>Ресторан не найден</h2>
          <Link href="/" className="btn btn-primary">На главную</Link>
        </div>
      </div>
    );
  }

  const handleConfirmBooking = () => {
    setBookingError("");
    createBooking.mutate({
      restaurantId: restaurant.id,
      date: selectedDate,
      time: selectedTime!,
      guestCount,
      guestName,
      guestPhone: guestPhone.replace(/\D/g, ""),
      tableId: selectedTable || undefined,
      specialRequests: specialRequests || undefined,
      source: "PLATFORM_WEB",
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header */}
      <header className="glass-card" style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid var(--color-border)",
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", height: 64, gap: 16 }}>
          <Link href="/" className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
            <ArrowLeft size={16} /> Назад
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <ThemeToggle />
          </div>
          <span style={{ fontSize: 15, fontWeight: 500 }}>{restaurant.name}</span>
        </div>
      </header>

      <main className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 32, alignItems: "start" }}>
          {/* Left: Restaurant Info */}
          <div>
            {/* Cover */}
            <div className="animate-fade-in" style={{
              height: 320, borderRadius: "var(--radius-lg)", overflow: "hidden",
              position: "relative", marginBottom: 32,
            }}>
              {restaurant.coverImage && (
                <Image src={restaurant.coverImage} alt={restaurant.name} fill
                  sizes="(max-width: 768px) 100vw, 900px"
                  style={{ objectFit: "cover" }} priority
                />
              )}
            </div>

            {/* Info */}
            <div className="animate-slide-up">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                {(restaurant.cuisine || []).map((c: string) => (
                  <span key={c} className="badge badge-gold">{CUISINE_LABELS[c] || c}</span>
                ))}
              </div>

              <h1 className="font-display" style={{ fontSize: 40, fontWeight: 500, marginBottom: 8 }}>
                {restaurant.name}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} size={16} fill={i <= Math.round(restaurant.avgRating) ? "var(--color-primary)" : "none"} color="var(--color-primary)" />
                  ))}
                  <span style={{ fontWeight: 500, color: "var(--color-primary)", marginLeft: 4 }}>{restaurant.avgRating}</span>
                  <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>({restaurant.reviewCount} отзывов)</span>
                </div>
                <span style={{ fontSize: 14, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={14} /> {restaurant.address}
                </span>
              </div>

              <p style={{ fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 24 }}>
                {(restaurant as Record<string, unknown>).description as string || restaurant.shortDesc}
              </p>

              {/* Features */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
                {(restaurant.features || []).map((f: string) => {
                  const feat = FEATURE_ICONS[f];
                  if (!feat) return null;
                  const Icon = feat.icon;
                  return (
                    <span key={f} className="feature-tag" style={{ gap: 6, padding: "6px 12px" }}>
                      <Icon size={12} /> {feat.label}
                    </span>
                  );
                })}
              </div>

              {/* Details */}
              <div className="glass-card" style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                <div>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                    <Clock size={12} /> Время работы
                  </span>
                  <span style={{ fontWeight: 400 }}>{restaurant.openingTime} - {restaurant.closingTime}</span>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                    <Users size={12} /> Макс. гостей
                  </span>
                  <span style={{ fontWeight: 400 }}>до {restaurant.maxPartySize}</span>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                    <Wine size={12} /> Столов
                  </span>
                  <span style={{ fontWeight: 400 }}>{(restaurant.tables || []).length}</span>
                </div>
              </div>

              {/* Working hours by day */}
              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={16} /> Часы работы
                </h3>
                <div className="glass-card" style={{ padding: 16 }}>
                  {["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"].map((day, i) => (
                    <div key={day} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 6 ? "1px solid var(--color-border)" : "none", fontSize: 13 }}>
                      <span style={{ color: "var(--color-text-secondary)" }}>{day}</span>
                      <span style={{ fontWeight: 400 }}>{restaurant.openingTime} - {restaurant.closingTime}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating metrics */}
              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Star size={16} /> Оценки гостей
                </h3>
                <div className="glass-card" style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    { label: "Еда", score: Math.min(5, restaurant.avgRating + 0.1) },
                    { label: "Обслуживание", score: Math.min(5, restaurant.avgRating - 0.1) },
                    { label: "Атмосфера", score: Math.min(5, restaurant.avgRating) },
                    { label: "Цена/качество", score: Math.min(5, restaurant.avgRating - 0.3) },
                  ].map((m) => (
                    <div key={m.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: "var(--color-text-secondary)" }}>{m.label}</span>
                        <span style={{ fontWeight: 500 }}>{m.score.toFixed(1)}</span>
                      </div>
                      <div style={{ height: 6, background: "var(--color-bg-elevated)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(m.score / 5) * 100}%`, background: "var(--color-primary)", borderRadius: 3, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Booking Panel */}
          <div style={{ position: "sticky", top: 80 }}>
            <div className="glass-card animate-scale-in" style={{ padding: 24 }}>
              {bookingStep === "select" && (
                <>
                  <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: 20, letterSpacing: "-0.02em" }}>Забронировать столик</h3>

                  {/* Date */}
                  <div style={{ marginBottom: 16 }}>
                    <label className="input-label"><Calendar size={12} style={{ display: "inline", marginRight: 4 }} />Дата</label>
                    <input type="date" className="input-field" value={selectedDate}
                      onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(null); setSelectedTable(null); }}
                      min={new Date().toISOString().split("T")[0]} />
                  </div>

                  {/* Guests */}
                  <div style={{ marginBottom: 16 }}>
                    <label className="input-label"><Users size={12} style={{ display: "inline", marginRight: 4 }} />Количество гостей</label>
                    <select className="input-field" value={guestCount}
                      onChange={(e) => { setGuestCount(Number(e.target.value)); setSelectedTime(null); setSelectedTable(null); }}>
                      {Array.from({ length: restaurant.maxPartySize }, (_, i) => i + 1).map((g) => (
                        <option key={g} value={g}>{g} {g === 1 ? "гость" : g < 5 ? "гостя" : "гостей"}</option>
                      ))}
                    </select>
                  </div>

                  {/* Time Slots */}
                  <div style={{ marginBottom: 16 }}>
                    <label className="input-label"><Clock size={12} style={{ display: "inline", marginRight: 4 }} />Выберите время</label>
                    {availableSlots.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {availableSlots.map((slot) => (
                          <button key={slot.time}
                            className={`time-slot ${selectedTime === slot.time ? "active" : ""} ${slot.isPeak ? "peak" : ""}`}
                            onClick={() => { setSelectedTime(slot.time); setSelectedTable(null); }}>
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 14, color: "var(--color-text-muted)", padding: "12px 0" }}>
                        Нет доступных слотов на {guestCount} {guestCount < 5 ? "гостя" : "гостей"}
                      </p>
                    )}
                    {availableSlots.some((s) => s.isPeak) && (
                      <p style={{ fontSize: 11, color: "var(--color-warning)", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-warning)", display: "inline-block" }} />
                        Пиковое время (18:00-21:00)
                      </p>
                    )}
                  </div>

                  {/* Table Selection */}
                  {selectedSlot && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <label className="input-label" style={{ marginBottom: 0 }}>Выберите стол</label>
                        <div style={{ display: "flex", gap: 2, background: "var(--color-bg-secondary)", borderRadius: "var(--radius-sm)", padding: 2 }}>
                          <button onClick={() => setTableView("list")} style={{
                            padding: "4px 8px", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer",
                            background: tableView === "list" ? "var(--color-bg-card)" : "transparent",
                            color: tableView === "list" ? "var(--color-primary)" : "var(--color-text-muted)",
                            boxShadow: tableView === "list" ? "var(--shadow-xs)" : "none",
                            transition: "all var(--transition-fast)",
                          }}><List size={14} /></button>
                          <button onClick={() => setTableView("map")} style={{
                            padding: "4px 8px", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer",
                            background: tableView === "map" ? "var(--color-bg-card)" : "transparent",
                            color: tableView === "map" ? "var(--color-primary)" : "var(--color-text-muted)",
                            boxShadow: tableView === "map" ? "var(--shadow-xs)" : "none",
                            transition: "all var(--transition-fast)",
                          }}><LayoutGrid size={14} /></button>
                        </div>
                      </div>

                      {tableView === "map" ? (
                        <FloorPlan
                          tables={selectedSlot.tables}
                          selectedTable={selectedTable}
                          onSelectTable={setSelectedTable}
                          guestCount={guestCount}
                        />
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {selectedSlot.tables.map((table) => (
                            <button key={table.id}
                              onClick={() => setSelectedTable(table.id)}
                              style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "12px 16px", borderRadius: "var(--radius-md)",
                                border: `1px solid ${selectedTable === table.id ? "var(--color-primary)" : "var(--color-border)"}`,
                                background: selectedTable === table.id ? "rgba(200, 169, 126, 0.08)" : "var(--color-bg-secondary)",
                                cursor: "pointer", transition: "all var(--transition-fast)",
                                color: "var(--color-text-primary)", textAlign: "left",
                              }}>
                              <div>
                                <span style={{ fontWeight: 400, fontSize: 14 }}>Стол {table.label}</span>
                                <span style={{ fontSize: 12, color: "var(--color-text-muted)", marginLeft: 8 }}>
                                  {TABLE_TYPE_LABELS[table.tableType]} / {table.minCapacity}-{table.maxCapacity} мест
                                </span>
                              </div>
                              {selectedTable === table.id && <Check size={16} style={{ color: "var(--color-primary)" }} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Deposit Info */}
                  {depositAmount > 0 && selectedTime && (
                    <div className="glass-card" style={{ padding: 12, marginBottom: 16, borderColor: "rgba(200, 169, 126, 0.2)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Депозит</span>
                        <span style={{ fontWeight: 400, color: "var(--color-primary)", fontSize: 16 }}>
                          {new Intl.NumberFormat("ru-RU").format(depositAmount)} руб.
                        </span>
                      </div>
                      {selectedSlot?.isPeak && (
                        <p style={{ fontSize: 11, color: "var(--color-warning)", marginTop: 4 }}>
                          x1.5 в пиковое время
                        </p>
                      )}
                    </div>
                  )}

                  {/* Book Button */}
                  <button className="btn btn-primary btn-lg" style={{ width: "100%" }}
                    disabled={!selectedTime}
                    onClick={() => setBookingStep("confirm")}>
                    {selectedTime ? "Продолжить" : "Выберите время"}
                  </button>
                </>
              )}

              {bookingStep === "confirm" && (
                <>
                  <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: 20 }}>Подтверждение</h3>

                  <div style={{ background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", padding: 16, marginBottom: 20 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 400, marginBottom: 8 }}>{restaurant.name}</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 14, color: "var(--color-text-secondary)" }}>
                      <span><Calendar size={12} style={{ display: "inline", marginRight: 4 }} />{formatDate(selectedDate)}</span>
                      <span><Clock size={12} style={{ display: "inline", marginRight: 4 }} />{selectedTime}</span>
                      <span><Users size={12} style={{ display: "inline", marginRight: 4 }} />{guestCount} {guestCount < 5 ? "гостя" : "гостей"}</span>
                      {selectedTable && <span>Стол: {selectedSlot?.tables.find(t => t.id === selectedTable)?.label}</span>}
                    </div>
                    {depositAmount > 0 && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 500 }}>Депозит:</span>
                        <span style={{ fontWeight: 400, color: "var(--color-primary)" }}>{new Intl.NumberFormat("ru-RU").format(depositAmount)} руб.</span>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label className="input-label">Ваше имя</label>
                    <input className="input-field" placeholder="Иван Иванов" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label className="input-label">Телефон</label>
                    <PhoneMaskedInput value={guestPhone} onChange={(v) => setGuestPhone(v)} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label className="input-label">Пожелания (необязательно)</label>
                    <textarea className="input-field" rows={3} placeholder="Детский стул, аллергия на орехи..."
                      value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)}
                      style={{ resize: "vertical" }} />
                  </div>

                  {bookingError && (
                    <div style={{ padding: "10px 14px", background: "rgba(220,53,69,0.08)", border: "1px solid rgba(220,53,69,0.2)", borderRadius: "var(--radius-sm)", color: "var(--color-error)", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
                      {bookingError}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setBookingStep("select")} disabled={createBooking.isPending}>Назад</button>
                    <button className="btn btn-primary" style={{ flex: 2, opacity: createBooking.isPending ? 0.7 : 1 }}
                      disabled={!guestName || !guestPhone || createBooking.isPending}
                      onClick={handleConfirmBooking}>
                      {createBooking.isPending ? "Отправка..." : "Забронировать"}
                    </button>
                  </div>
                </>
              )}

              {bookingStep === "success" && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "rgba(52, 211, 153, 0.15)", border: "2px solid var(--color-success)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px",
                  }}>
                    <Check size={32} style={{ color: "var(--color-success)" }} />
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 500, marginBottom: 8 }}>Бронь подтверждена!</h3>
                  {bookingId && <p style={{ fontSize: 12, color: "var(--color-primary)", marginBottom: 4 }}>ID: {bookingId}</p>}
                  <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 20 }}>
                    {restaurant.name}<br />
                    {formatDate(selectedDate)}, {selectedTime}<br />
                    {guestCount} {guestCount < 5 ? "гостя" : "гостей"}
                  </p>
                  {depositAmount > 0 && (
                    <div className="badge badge-gold" style={{ marginBottom: 16, fontSize: 14, padding: "8px 16px" }}>
                      Депозит: {new Intl.NumberFormat("ru-RU").format(depositAmount)} руб.
                    </div>
                  )}
                  <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20 }}>
                    SMS-подтверждение отправлено на {guestPhone}
                  </p>
                  <Link href="/" className="btn btn-primary" style={{ width: "100%", textDecoration: "none" }}>
                    На главную
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
