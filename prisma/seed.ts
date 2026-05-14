import { PrismaClient } from "@prisma/client";
import { neon } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL!;
const sql = neon(databaseUrl);
const adapter = new PrismaNeon({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

// Демо-пользователь (владелец всех ресторанов в seed)
const DEMO_OWNER_EMAIL = "admin@restobooking.ru";
const DEMO_OWNER_HASH = "$2b$10$dummyHashForSeeding";

const RESTAURANTS = [
  { name: "Краб Хаус", slug: "krab-haus", desc: "Ресторан морепродуктов на набережной Сочи с террасой и видом на Черное море. Свежие крабы, мидии и устрицы.", shortDesc: "Крабы и морепродукты Черного моря", cuisine: ["SEAFOOD"], priceRange: "PREMIUM" as const, city: "Сочи", address: "Курортный пр., 12", avgRating: 4.3, reviewCount: 1567, cover: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=75", deposit: 1000, features: ["sea_view","terrace","parking"], tables: [{ label: "1", min: 2, max: 4, type: "STANDARD" as const }, { label: "2", min: 2, max: 2, type: "BAR" as const }, { label: "VIP", min: 2, max: 8, type: "VIP" as const }] },
  { name: "Винотека 3/9", slug: "vinoteka-39", desc: "Уютный винный бар на Навагинской улице Сочи. Более 200 позиций вин из России и мира, авторские закуски от шефа.", shortDesc: "Винный бар с авторскими закусками", cuisine: ["FUSION","FRENCH"], priceRange: "MODERATE" as const, city: "Сочи", address: "ул. Навагинская, 7", avgRating: 4.6, reviewCount: 654, cover: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=75", deposit: 0, features: ["wine_list","live_music"], tables: [{ label: "1", min: 2, max: 4, type: "STANDARD" as const }, { label: "Бар", min: 1, max: 2, type: "BAR" as const }] },
  { name: "White Rabbit", slug: "white-rabbit", desc: "Один из самых известных ресторанов Москвы, расположенный на 16-м этаже. Шеф-повар Владимир Мухин создает уникальные блюда высокой русской кухни.", shortDesc: "Ресторан высокой русской кухни с панорамным видом", cuisine: ["RUSSIAN","FUSION"], priceRange: "LUXURY" as const, city: "Москва", address: "Смоленская пл., 3, 16-й этаж", avgRating: 4.8, reviewCount: 2847, cover: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=75", deposit: 5000, features: ["vip","terrace","parking"], tables: [{ label: "1", min: 2, max: 4, type: "STANDARD" as const }, { label: "VIP", min: 2, max: 8, type: "VIP" as const }] },
  { name: "Selfie", slug: "selfie", desc: "Ресторан авторской кухни Анатолия Казакова, отмеченный звездой Michelin.", shortDesc: "Авторская кухня Анатолия Казакова", cuisine: ["RUSSIAN","FUSION"], priceRange: "LUXURY" as const, city: "Москва", address: "Новинский бул., 31", avgRating: 4.7, reviewCount: 1923, cover: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=75", deposit: 3000, features: ["vip","private_room"], tables: [{ label: "1", min: 2, max: 4, type: "STANDARD" as const }] },
  { name: "Twins Garden", slug: "twins-garden", desc: "Гастрономический ресторан братьев Березуцких, входящий в рейтинг The Worlds 50 Best.", shortDesc: "Гастрономический ресторан братьев Березуцких", cuisine: ["RUSSIAN","FUSION"], priceRange: "LUXURY" as const, city: "Москва", address: "Страстной бул., 8а", avgRating: 4.9, reviewCount: 1456, cover: "https://images.unsplash.com/photo-1560053608-13721e0d69e8?w=600&q=75", deposit: 7000, features: ["tasting_menu","wine_pairing","vip"], tables: [{ label: "1", min: 2, max: 4, type: "VIP" as const }] },
  { name: "Белуга", slug: "beluga", desc: "Легендарный ресторан при отеле Националь с видом на Кремль.", shortDesc: "Легендарный ресторан русской кухни", cuisine: ["RUSSIAN","SEAFOOD"], priceRange: "LUXURY" as const, city: "Москва", address: "ул. Тверская, 15", avgRating: 4.8, reviewCount: 2134, cover: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=75", deposit: 3000, features: ["vip","terrace","live_music","parking"], tables: [{ label: "1", min: 2, max: 2, type: "STANDARD" as const }, { label: "VIP-1", min: 2, max: 8, type: "VIP" as const }] },
  { name: "Пушкинъ", slug: "pushkin", desc: "Культовый ресторан, воссоздающий атмосферу русского дворянского клуба XIX века.", shortDesc: "Классика русской кухни в интерьере XIX века", cuisine: ["RUSSIAN"], priceRange: "PREMIUM" as const, city: "Москва", address: "Тверской бул., 26а", avgRating: 4.6, reviewCount: 4521, cover: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=75", deposit: 2000, features: ["vip","parking","live_music"], tables: [{ label: "1", min: 2, max: 4, type: "STANDARD" as const }, { label: "2", min: 2, max: 6, type: "STANDARD" as const }] },
  { name: "La Piazza", slug: "la-piazza", desc: "Итальянская траттория на Невском проспекте.", shortDesc: "Итальянская траттория в центре", cuisine: ["ITALIAN"], priceRange: "MODERATE" as const, city: "Санкт-Петербург", address: "Невский пр., 44", avgRating: 4.4, reviewCount: 2345, cover: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=75", deposit: 0, features: ["outdoor_seating","wine_list","live_music"], tables: [{ label: "1", min: 2, max: 4, type: "STANDARD" as const }] },
  { name: "Хинкальная", slug: "hinkalnaya", desc: "Уютная грузинская кухня с хинкали ручной лепки по семейным рецептам.", shortDesc: "Грузинская кухня с хинкали ручной лепки", cuisine: ["GEORGIAN"], priceRange: "BUDGET" as const, city: "Москва", address: "ул. Покровка, 28", avgRating: 4.4, reviewCount: 3456, cover: "https://images.unsplash.com/photo-1515669097368-22e68427d265?w=600&q=75", deposit: 0, features: ["family_friendly","group_events"], tables: [{ label: "1", min: 2, max: 4, type: "STANDARD" as const }, { label: "Большой", min: 4, max: 20, type: "PRIVATE" as const }] },
  { name: "Nobu Moscow", slug: "nobu-moscow", desc: "Филиал всемирно известной империи Нобу Мацухисы. Авторская японская кухня с перуанскими акцентами.", shortDesc: "Японская кухня с перуанскими мотивами", cuisine: ["JAPANESE","FUSION"], priceRange: "LUXURY" as const, city: "Москва", address: "Б. Дмитровка, 20/5", avgRating: 4.6, reviewCount: 1567, cover: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=75", deposit: 4000, features: ["vip","sushi_bar"], tables: [{ label: "1", min: 2, max: 4, type: "STANDARD" as const }] },
];

async function main() {
  console.log("Seeding RESTBooking database...");
  
  // Создаем демо-пользователя (admin)
  const admin = await prisma.user.upsert({
    where: { email: DEMO_OWNER_EMAIL },
    update: {},
    create: {
      email: DEMO_OWNER_EMAIL,
      name: "Demo Admin",
      passwordHash: DEMO_OWNER_HASH,
      role: "PLATFORM_ADMIN",
    },
  });
  console.log(`Admin: ${admin.id} (${admin.email})`);

  let count = 0;
  for (const r of RESTAURANTS) {
    // Проверяем, есть ли уже
    const existing = await prisma.restaurant.findUnique({ where: { slug: r.slug } });
    if (existing) {
      console.log(`  Skip: ${r.name} (already exists)`);
      count++;
      continue;
    }

    // Уникальный владелец для каждого ресторана (ownerId unique constraint)
    const ownerEmail = `owner-${r.slug}@restobooking.ru`;
    const owner = await prisma.user.upsert({
      where: { email: ownerEmail },
      update: {},
      create: {
        email: ownerEmail,
        name: `Owner ${r.name}`,
        passwordHash: DEMO_OWNER_HASH,
        role: "RESTAURANT_ADMIN",
      },
    });

    const restaurant = await prisma.restaurant.create({
      data: {
        ownerId: owner.id,
        name: r.name,
        slug: r.slug,
        description: r.desc,
        shortDesc: r.shortDesc,
        cuisine: r.cuisine as never[],
        priceRange: r.priceRange,
        city: r.city,
        address: r.address,
        avgRating: r.avgRating,
        reviewCount: r.reviewCount,
        coverImage: r.cover,
        features: r.features,
        depositRequired: r.deposit > 0,
        depositAmount: r.deposit > 0 ? r.deposit : null,
        maxPartySize: 12,
      },
    });

    // Создаем зал
    const hall = await prisma.hall.create({
      data: {
        restaurantId: restaurant.id,
        name: "Основной зал",
        sortOrder: 0,
      },
    });

    // Создаем столы
    for (let i = 0; i < r.tables.length; i++) {
      const t = r.tables[i];
      await prisma.table.create({
        data: {
          restaurantId: restaurant.id,
          hallId: hall.id,
          label: t.label,
          minCapacity: t.min,
          maxCapacity: t.max,
          tableType: t.type,
          positionX: 80 + i * 150,
          positionY: 80 + (i % 2) * 120,
          shape: i % 2 === 0 ? "rect" : "circle",
          sortOrder: i,
        },
      });
    }

    count++;
    console.log(`  [${count}/${RESTAURANTS.length}] ${r.name} (${r.city}) + ${r.tables.length} tables`);
  }

  console.log(`\nDone! Seeded ${count} restaurants.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
