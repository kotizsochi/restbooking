export const MOCK_RESTAURANTS = [
  {
    id: "rest_1",
    name: "Белуга",
    slug: "beluga",
    shortDesc: "Высокая русская кухня с видом на город",
    description:
      "Ресторан Белуга - это утонченная русская кухня, авторские коктейли и панорамный вид на центр Москвы. Шеф-повар создает блюда из лучших российских продуктов.",
    cuisine: ["RUSSIAN", "SEAFOOD"],
    priceRange: "LUXURY",
    city: "Москва",
    address: "ул. Тверская, 15",
    avgRating: 4.8,
    reviewCount: 342,
    openingTime: "12:00",
    closingTime: "00:00",
    features: ["vip", "terrace", "live_music", "parking"],
    coverImage: "/images/restaurants/beluga.jpg",
    depositRequired: true,
    depositAmount: 2000,
    maxPartySize: 10,
    tables: [
      { id: "t1", label: "1", minCapacity: 2, maxCapacity: 2, tableType: "STANDARD" },
      { id: "t2", label: "2", minCapacity: 2, maxCapacity: 4, tableType: "STANDARD" },
      { id: "t3", label: "3", minCapacity: 4, maxCapacity: 6, tableType: "STANDARD" },
      { id: "t4", label: "VIP-1", minCapacity: 2, maxCapacity: 8, tableType: "VIP" },
      { id: "t5", label: "T-1", minCapacity: 2, maxCapacity: 4, tableType: "TERRACE" },
      { id: "t6", label: "T-2", minCapacity: 4, maxCapacity: 6, tableType: "TERRACE" },
      { id: "t7", label: "B-1", minCapacity: 1, maxCapacity: 2, tableType: "BAR" },
    ],
  },
  {
    id: "rest_2",
    name: "Sakura Garden",
    slug: "sakura-garden",
    shortDesc: "Аутентичная японская кухня и омакасе",
    description:
      "Sakura Garden - изысканный японский ресторан с мастерами суши из Токио. Омакасе-сеты, свежайшие морепродукты и традиционные сакэ.",
    cuisine: ["JAPANESE"],
    priceRange: "PREMIUM",
    city: "Москва",
    address: "Пресненская наб., 8",
    avgRating: 4.6,
    reviewCount: 218,
    openingTime: "11:00",
    closingTime: "23:00",
    features: ["private_room", "sushi_bar", "sake_collection"],
    coverImage: "/images/restaurants/sakura.jpg",
    depositRequired: true,
    depositAmount: 1500,
    maxPartySize: 8,
    tables: [
      { id: "t8", label: "1", minCapacity: 2, maxCapacity: 2, tableType: "STANDARD" },
      { id: "t9", label: "2", minCapacity: 2, maxCapacity: 4, tableType: "STANDARD" },
      { id: "t10", label: "Сушичная", minCapacity: 1, maxCapacity: 2, tableType: "BAR" },
      { id: "t11", label: "Private", minCapacity: 4, maxCapacity: 8, tableType: "PRIVATE" },
    ],
  },
  {
    id: "rest_3",
    name: "Хинкальная Дед",
    slug: "hinkalnaya-ded",
    shortDesc: "Настоящая грузинская кухня и домашнее вино",
    description:
      "Хинкальная Дед - уютное место с аутентичной грузинской кухней. Хинкали ручной лепки, хачапури по-аджарски и домашнее вино из Кахетии.",
    cuisine: ["GEORGIAN"],
    priceRange: "MODERATE",
    city: "Москва",
    address: "ул. Покровка, 28",
    avgRating: 4.5,
    reviewCount: 567,
    openingTime: "10:00",
    closingTime: "23:00",
    features: ["family_friendly", "terrace", "group_events"],
    coverImage: "/images/restaurants/georgian.jpg",
    depositRequired: false,
    maxPartySize: 20,
    tables: [
      { id: "t12", label: "1", minCapacity: 2, maxCapacity: 4, tableType: "STANDARD" },
      { id: "t13", label: "2", minCapacity: 2, maxCapacity: 4, tableType: "STANDARD" },
      { id: "t14", label: "3", minCapacity: 4, maxCapacity: 6, tableType: "STANDARD" },
      { id: "t15", label: "4", minCapacity: 4, maxCapacity: 6, tableType: "STANDARD" },
      { id: "t16", label: "Большой", minCapacity: 8, maxCapacity: 20, tableType: "PRIVATE" },
      { id: "t17", label: "Терраса-1", minCapacity: 2, maxCapacity: 4, tableType: "TERRACE" },
    ],
  },
  {
    id: "rest_4",
    name: "La Piazza",
    slug: "la-piazza",
    shortDesc: "Итальянская траттория в сердце Петербурга",
    description:
      "La Piazza - настоящая итальянская траттория. Паста ручной работы, пицца из дровяной печи и вина из лучших виноделен Италии.",
    cuisine: ["ITALIAN"],
    priceRange: "MODERATE",
    city: "Санкт-Петербург",
    address: "Невский пр., 44",
    avgRating: 4.4,
    reviewCount: 445,
    openingTime: "11:00",
    closingTime: "23:00",
    features: ["outdoor_seating", "wine_list", "live_music"],
    coverImage: "/images/restaurants/italian.jpg",
    depositRequired: false,
    maxPartySize: 10,
    tables: [
      { id: "t18", label: "1", minCapacity: 2, maxCapacity: 2, tableType: "STANDARD" },
      { id: "t19", label: "2", minCapacity: 2, maxCapacity: 4, tableType: "STANDARD" },
      { id: "t20", label: "3", minCapacity: 4, maxCapacity: 6, tableType: "STANDARD" },
      { id: "t21", label: "Терраса", minCapacity: 2, maxCapacity: 4, tableType: "TERRACE" },
    ],
  },
  {
    id: "rest_5",
    name: "Chef's Table",
    slug: "chefs-table",
    shortDesc: "Авторская кухня и гастрономические впечатления",
    description:
      "Chef's Table - ресторан авторской кухни от шеф-повара с мишленовским опытом. Сезонное дегустационное меню, уникальная подача и атмосфера.",
    cuisine: ["FUSION", "FRENCH"],
    priceRange: "LUXURY",
    city: "Москва",
    address: "Патриаршие пруды, Малый Козихинский пер., 7",
    avgRating: 4.9,
    reviewCount: 128,
    openingTime: "18:00",
    closingTime: "00:00",
    features: ["tasting_menu", "wine_pairing", "private_events", "vip"],
    coverImage: "/images/restaurants/chefs-table.jpg",
    depositRequired: true,
    depositAmount: 5000,
    maxPartySize: 6,
    tables: [
      { id: "t22", label: "1", minCapacity: 2, maxCapacity: 2, tableType: "VIP" },
      { id: "t23", label: "2", minCapacity: 2, maxCapacity: 4, tableType: "VIP" },
      { id: "t24", label: "Chef's Bar", minCapacity: 1, maxCapacity: 2, tableType: "BAR" },
      { id: "t25", label: "Private", minCapacity: 4, maxCapacity: 6, tableType: "PRIVATE" },
    ],
  },
  {
    id: "rest_6",
    name: "Мясо & Рыба",
    slug: "myaso-i-ryba",
    shortDesc: "Стейки на гриле и свежие морепродукты",
    description:
      "Мясо & Рыба - ресторан для ценителей стейков и морепродуктов. Мраморная говядина, устрицы, крабы и фирменные соусы.",
    cuisine: ["STEAKHOUSE", "SEAFOOD"],
    priceRange: "PREMIUM",
    city: "Сочи",
    address: "Курортный пр., 12",
    avgRating: 4.3,
    reviewCount: 289,
    openingTime: "12:00",
    closingTime: "23:00",
    features: ["sea_view", "terrace", "wine_cellar", "parking"],
    coverImage: "/images/restaurants/steak.jpg",
    depositRequired: true,
    depositAmount: 1000,
    maxPartySize: 12,
    tables: [
      { id: "t26", label: "1", minCapacity: 2, maxCapacity: 2, tableType: "STANDARD" },
      { id: "t27", label: "2", minCapacity: 2, maxCapacity: 4, tableType: "STANDARD" },
      { id: "t28", label: "3", minCapacity: 4, maxCapacity: 6, tableType: "STANDARD" },
      { id: "t29", label: "Видовой", minCapacity: 2, maxCapacity: 4, tableType: "TERRACE" },
      { id: "t30", label: "VIP", minCapacity: 4, maxCapacity: 12, tableType: "VIP" },
    ],
  },
];

export function getAvailableSlots(
  restaurantId: string,
  date: string,
  guestCount: number
) {
  const restaurant = MOCK_RESTAURANTS.find((r) => r.id === restaurantId);
  if (!restaurant) return [];

  const suitableTables = restaurant.tables.filter(
    (t) => t.minCapacity <= guestCount && t.maxCapacity >= guestCount
  );

  if (suitableTables.length === 0) return [];

  const [openH] = restaurant.openingTime.split(":").map(Number);
  const [closeH] = restaurant.closingTime.split(":").map(Number);
  const adjustedCloseH = closeH === 0 ? 24 : closeH;

  const slots: {
    time: string;
    tables: typeof suitableTables;
    isPeak: boolean;
  }[] = [];

  for (let h = openH; h < adjustedCloseH - 1; h++) {
    for (const m of [0, 30]) {
      const timeStr = `${String(h % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const isPeak = h >= 18 && h <= 21;

      // Mock: некоторые слоты заняты (рандомно, но детерминированно по дате)
      const dateHash = date.split("-").reduce((a, b) => a + parseInt(b), 0);
      const slotHash = (dateHash + h * 60 + m) % 7;
      const availableTables = suitableTables.filter(
        (_, i) => (slotHash + i) % 3 !== 0
      );

      if (availableTables.length > 0) {
        slots.push({ time: timeStr, tables: availableTables, isPeak });
      }
    }
  }

  return slots;
}

export type MockRestaurant = (typeof MOCK_RESTAURANTS)[number];
export type MockTable = MockRestaurant["tables"][number];
