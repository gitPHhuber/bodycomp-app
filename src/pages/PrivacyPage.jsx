import { useMeta } from "../utils/useMeta";

const sectionStyle = {
  borderTop: "1px solid #1e293b",
  paddingTop: 24,
  marginTop: 24,
};

const h2Style = {
  color: "#e2e8f0",
  fontSize: 20,
  fontWeight: 700,
  marginBottom: 12,
  fontFamily: "'Outfit', sans-serif",
};

const pStyle = {
  color: "#94a3b8",
  fontSize: 15,
  lineHeight: 1.7,
  marginBottom: 12,
  fontFamily: "'Outfit', sans-serif",
};

const ulStyle = {
  color: "#94a3b8",
  fontSize: 15,
  lineHeight: 1.7,
  paddingLeft: 20,
  marginBottom: 12,
  fontFamily: "'Outfit', sans-serif",
};

const liStyle = {
  marginBottom: 6,
};

const linkStyle = {
  color: "#22d3ee",
  textDecoration: "underline",
};

export default function PrivacyPage() {
  useMeta(
    "Политика конфиденциальности — BodyComp",
    "Политика обработки персональных данных сайта BodyComp. Информация о сборе, хранении и защите ваших данных."
  );

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#020617",
        paddingTop: 80,
        paddingBottom: 60,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px" }}>
        {/* Page title */}
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            marginBottom: 8,
            background: "linear-gradient(135deg, #e2e8f0, #22d3ee)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Политика конфиденциальности
        </h1>
        <p style={{ ...pStyle, color: "#64748b", fontSize: 13, marginBottom: 32 }}>
          Последнее обновление: 14 марта 2026 г.
        </p>

        {/* Disclaimer */}
        <div style={{
          padding: "12px 16px",
          borderRadius: 10,
          background: "#f59e0b11",
          border: "1px solid #f59e0b33",
          marginBottom: 32,
        }}>
          <p style={{ ...pStyle, color: "#fbbf24", fontSize: 13, marginBottom: 0 }}>
            Данный документ — шаблон. Рекомендуем согласовать с юристом перед использованием.
          </p>
        </div>

        {/* 1. Общие положения */}
        <section id="general">
          <h2 style={h2Style}>1. Общие положения</h2>
          <p style={pStyle}>
            Настоящая Политика конфиденциальности определяет порядок обработки
            и защиты персональных данных пользователей сайта BodyComp (далее — «Сайт»).
          </p>
          <p style={pStyle}>
            Оператором персональных данных является ООО «АСВОМЕД» (далее — «Оператор»).
          </p>
          <p style={pStyle}>
            Используя Сайт и предоставляя свои данные, вы подтверждаете согласие
            с условиями настоящей Политики. Если вы не согласны — пожалуйста,
            не используйте Сайт и не предоставляйте свои данные.
          </p>
          <p style={pStyle}>
            Политика разработана в соответствии с Федеральным законом от 27.07.2006
            № 152-ФЗ «О персональных данных».
          </p>
        </section>

        {/* 2. Цели обработки */}
        <section style={sectionStyle} id="purposes">
          <h2 style={h2Style}>2. Цели обработки данных</h2>
          <p style={pStyle}>Мы обрабатываем ваши данные для следующих целей:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>
              <strong style={{ color: "#e2e8f0" }}>Регистрация и авторизация</strong> — создание
              личного кабинета, вход на сайт.
            </li>
            <li style={liStyle}>
              <strong style={{ color: "#e2e8f0" }}>Запись на медицинские исследования</strong> — обработка
              заявок на DXA-сканирование, связь с вами для подтверждения записи.
            </li>
            <li style={liStyle}>
              <strong style={{ color: "#e2e8f0" }}>Хранение результатов исследований</strong> — сохранение
              данных DXA-сканирования в вашем личном кабинете. Только при наличии
              вашего <a href="#health-data" style={linkStyle}>отдельного согласия</a>.
            </li>
            <li style={liStyle}>
              <strong style={{ color: "#e2e8f0" }}>Информационные материалы</strong> — отправка
              напоминаний о повторных обследованиях и полезных материалов.
              Только при наличии вашего отдельного согласия.
            </li>
            <li style={liStyle}>
              <strong style={{ color: "#e2e8f0" }}>Аналитика</strong> — улучшение работы сайта
              на основе обезличенных данных о поведении пользователей.
            </li>
          </ul>
        </section>

        {/* 3. Состав данных */}
        <section style={sectionStyle} id="data-types">
          <h2 style={h2Style}>3. Какие данные мы собираем</h2>

          <p style={{ ...pStyle, color: "#e2e8f0", fontWeight: 600 }}>Регистрационные данные</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Имя, адрес электронной почты (email)</li>
            <li style={liStyle}>Номер телефона — при записи на исследование</li>
          </ul>

          <p style={{ ...pStyle, color: "#e2e8f0", fontWeight: 600 }}>Данные профиля</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Пол, возраст, рост — при заполнении профиля или использовании калькулятора состава тела</li>
            <li style={liStyle}>Город — для подбора клиники</li>
          </ul>

          <p style={{ ...pStyle, color: "#e2e8f0", fontWeight: 600 }}>
            Данные о здоровье (специальная категория)
          </p>
          <ul style={ulStyle}>
            <li style={liStyle}>
              Результаты DXA-исследований: процент жировой ткани, мышечная масса,
              минеральная плотность костей и другие показатели.
              Обрабатываются только при наличии вашего{" "}
              <a href="#health-data" style={linkStyle}>отдельного согласия</a>.
            </li>
          </ul>

          <p style={{ ...pStyle, color: "#e2e8f0", fontWeight: 600 }}>Технические данные (обезличенные)</p>
          <ul style={ulStyle}>
            <li style={liStyle}>IP-адрес, тип браузера и устройства</li>
            <li style={liStyle}>Файлы cookies, идентификатор сессии (session_id)</li>
            <li style={liStyle}>Данные о взаимодействии с сайтом (страницы, время визита)</li>
          </ul>
        </section>

        {/* 4. Правовые основания */}
        <section style={sectionStyle} id="legal-basis">
          <h2 style={h2Style}>4. Правовые основания обработки</h2>
          <ul style={ulStyle}>
            <li style={liStyle}>
              <strong style={{ color: "#e2e8f0" }}>Согласие</strong> (ст. 6, ч. 1, п. 1 и ст. 9 ФЗ-152) —
              вы даёте согласие, отмечая чекбокс при регистрации на сайте.
            </li>
            <li style={liStyle}>
              <strong style={{ color: "#e2e8f0" }}>Отдельное согласие на данные о здоровье</strong> (ст. 10 ФЗ-152) —
              запрашивается отдельно перед сохранением результатов DXA-исследований.
            </li>
            <li style={liStyle}>
              <strong style={{ color: "#e2e8f0" }}>Согласие на информационные материалы</strong> —
              опциональный чекбокс при регистрации, не влияет на возможность использования сайта.
            </li>
          </ul>
          <p style={pStyle}>
            Согласие на обработку данных может быть отозвано вами в любой момент.
          </p>
        </section>

        {/* 5. Передача третьим лицам */}
        <section style={sectionStyle} id="third-parties">
          <h2 style={h2Style}>5. Передача данных третьим лицам</h2>
          <ul style={ulStyle}>
            <li style={liStyle}>
              <strong style={{ color: "#e2e8f0" }}>Supabase (Supabase Inc.)</strong> — платформа
              для хранения данных и аутентификации. Данные хранятся на серверах, обеспечивающих
              защиту в соответствии с отраслевыми стандартами.
            </li>
            <li style={liStyle}>
              <strong style={{ color: "#e2e8f0" }}>ООО «Яндекс»</strong> — сервис веб-аналитики
              Яндекс.Метрика. Собираются обезличенные данные о поведении пользователей
              (подробнее — в разделе{" "}
              <a href="#cookies" style={linkStyle}>«Cookies и аналитика»</a>).
            </li>
          </ul>
          <p style={pStyle}>
            Мы не продаём и не передаём ваши персональные данные иным третьим лицам,
            за исключением случаев, предусмотренных законодательством РФ.
          </p>
        </section>

        {/* 6. Хранение и защита */}
        <section style={sectionStyle} id="storage">
          <h2 style={h2Style}>6. Хранение и защита данных</h2>
          <p style={pStyle}>
            Персональные данные хранятся до момента отзыва вами согласия
            или удаления аккаунта, если иное не предусмотрено законодательством.
          </p>
          <p style={pStyle}>Для защиты данных мы применяем:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>
              Передача данных по защищённому протоколу HTTPS (TLS-шифрование).
            </li>
            <li style={liStyle}>
              Разграничение доступа на уровне строк базы данных (Row Level Security).
            </li>
            <li style={liStyle}>
              Ограничение круга лиц с доступом к персональным данным.
            </li>
          </ul>
        </section>

        {/* 7. Данные о здоровье */}
        <section style={sectionStyle} id="health-data">
          <h2 style={h2Style}>7. Обработка данных о здоровье</h2>
          <p style={pStyle}>
            Результаты DXA-исследований (состав тела, плотность костей) относятся
            к специальной категории персональных данных — данным о состоянии здоровья
            (ст. 10 Федерального закона № 152-ФЗ).
          </p>
          <p style={pStyle}>
            Мы обрабатываем эти данные только при наличии вашего отдельного письменного
            согласия, которое запрашивается перед первым сохранением результатов
            исследований в личном кабинете.
          </p>
          <p style={pStyle}>
            Вы имеете право в любой момент отозвать согласие на обработку данных
            о здоровье и потребовать их удаления.
          </p>
        </section>

        {/* 8. Права субъекта */}
        <section style={sectionStyle} id="rights">
          <h2 style={h2Style}>8. Ваши права</h2>
          <p style={pStyle}>В соответствии с ФЗ-152 вы имеете право:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>
              Получить информацию об обработке ваших данных Оператором.
            </li>
            <li style={liStyle}>
              Потребовать исправления неточных или неполных данных.
            </li>
            <li style={liStyle}>
              Потребовать удаления ваших персональных данных.
            </li>
            <li style={liStyle}>
              Отозвать согласие на обработку персональных данных.
            </li>
            <li style={liStyle}>
              Обжаловать действия Оператора в Роскомнадзор
              или в судебном порядке.
            </li>
          </ul>
          <p style={pStyle}>
            Оператор обязан рассмотреть ваш запрос в течение 10 рабочих дней.
          </p>
        </section>

        {/* 9. Cookies и аналитика */}
        <section style={sectionStyle} id="cookies">
          <h2 style={h2Style}>9. Cookies и аналитика</h2>
          <p style={pStyle}>
            Сайт использует файлы cookies и сервис веб-аналитики Яндекс.Метрика,
            предоставляемый ООО «Яндекс».
          </p>
          <p style={pStyle}>Яндекс.Метрика собирает обезличенные данные:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>
              Информацию о посещённых страницах, времени визита, источнике перехода.
            </li>
            <li style={liStyle}>
              Данные об устройстве, браузере и операционной системе.
            </li>
            <li style={liStyle}>
              Записи действий посетителей (Вебвизор) — для анализа удобства
              использования сайта.
            </li>
          </ul>
          <p style={pStyle}>
            Эти данные не позволяют идентифицировать конкретного пользователя
            и используются для улучшения работы сайта.
          </p>
          <p style={pStyle}>
            Вы можете отказаться от cookies, изменив настройки браузера.
            Для отказа от Яндекс.Метрики установите{" "}
            <a
              href="https://yandex.ru/support/metrica/general/opt-out.html"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              дополнение для браузера
            </a>
            .
          </p>
        </section>

        {/* Footer note */}
        <div style={{ ...sectionStyle, paddingBottom: 40 }}>
          <p style={{ ...pStyle, color: "#475569", fontSize: 13 }}>
            Оператор оставляет за собой право вносить изменения в настоящую Политику.
            Актуальная версия размещается на данной странице с указанием даты обновления.
          </p>
        </div>
      </div>
    </div>
  );
}
