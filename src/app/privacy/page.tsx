import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Политика конфиденциальности - RESTObooking",
  description: "Политика обработки персональных данных RESTObooking",
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px" }}>
      <Link href="/" style={{ fontSize: 13, color: "var(--color-primary)", textDecoration: "none", marginBottom: 24, display: "block" }}>
        Вернуться на главную
      </Link>
      <h1 style={{ fontSize: 28, fontWeight: 500, marginBottom: 24 }}>Политика конфиденциальности</h1>

      <div style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
        <p style={{ marginBottom: 16 }}>
          Настоящая Политика конфиденциальности (далее "Политика") определяет порядок обработки и защиты
          персональных данных пользователей сервиса RESTObooking (далее "Сервис").
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 500, marginTop: 32, marginBottom: 12, color: "var(--color-text-primary)" }}>1. Какие данные мы собираем</h2>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          <li>Имя, телефон и email при бронировании</li>
          <li>Данные аутентификации (email, зашифрованный пароль)</li>
          <li>Информация о посещениях и бронированиях</li>
          <li>Технические данные (IP-адрес, тип браузера, cookies)</li>
        </ul>

        <h2 style={{ fontSize: 18, fontWeight: 500, marginTop: 32, marginBottom: 12, color: "var(--color-text-primary)" }}>2. Цели обработки</h2>
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          <li>Исполнение обязательств по бронированию столиков</li>
          <li>Отправка уведомлений о статусе бронирования</li>
          <li>Улучшение качества сервиса и аналитика</li>
          <li>Обеспечение безопасности системы</li>
        </ul>

        <h2 style={{ fontSize: 18, fontWeight: 500, marginTop: 32, marginBottom: 12, color: "var(--color-text-primary)" }}>3. Cookies</h2>
        <p style={{ marginBottom: 16 }}>
          Сервис использует файлы cookie для аутентификации, аналитики (Яндекс.Метрика, Google Analytics)
          и персонализации. Вы можете отключить cookies в настройках браузера.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 500, marginTop: 32, marginBottom: 12, color: "var(--color-text-primary)" }}>4. Защита данных</h2>
        <p style={{ marginBottom: 16 }}>
          Пароли хранятся в зашифрованном виде (bcrypt). Передача данных осуществляется по протоколу HTTPS.
          Доступ к данным ограничен авторизованными сотрудниками.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 500, marginTop: 32, marginBottom: 12, color: "var(--color-text-primary)" }}>5. Контакты</h2>
        <p>
          По вопросам обработки персональных данных: <a href="mailto:support@restobooking.ru" style={{ color: "var(--color-primary)" }}>support@restobooking.ru</a>
        </p>
      </div>
    </div>
  );
}
