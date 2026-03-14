import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMeta } from "../../utils/useMeta";
import * as tracker from "../../lib/tracker";
import { ARTICLES } from "../../content/articles";
import { useJsonLd } from "../../utils/useJsonLd";
import ArticleContent from "../../components/ArticleContent";

/* ── Data (B2B article: stratos-vs-cheap) ────────────────── */

const STATS = [
  { value: "14 млн", label: "россиян с остеопорозом", color: "#ef4444" },
  { value: "20 млн", label: "с остеопенией", color: "#ef4444" },
  { value: "1 перелом", label: "каждые 5 минут", color: "#ef4444" },
  { value: "+43%", label: "рост переломов к 2035", color: "#ef4444" },
];

const RISKS = [
  {
    icon: "⚠️",
    title: "Ошибка классификации до 45%",
    text: "Исследование Henzell et al. показало: при сравнении результатов pencil beam и fan beam систем расхождение в диагностике достигает 17–45%. Почти каждый второй пациент может получить неверный T-score.",
  },
  {
    icon: "🦴",
    title: "Пропущенные переломы позвонков",
    text: "Без модуля VFA/DVA клиника не видит 2 из 3 компрессионных переломов позвонков, которые обнаруживаются «попутно» при правильном сканировании.",
  },
  {
    icon: "💰",
    title: "Потерянная выручка",
    text: "Body composition DXA приносит ₽7 500–13 800 за скан — в 2–4 раза больше стандартной денситометрии. Денситометр без этой функции теряет основной растущий сегмент.",
  },
  {
    icon: "⏱️",
    title: "Очереди и отток пациентов",
    text: "15–25 минут на сканирование при карандашном луче vs <5 минут на Stratos dR. Разница между 15 и 30+ пациентами в день.",
  },
  {
    icon: "👶",
    title: "Нет педиатрии и саркопении",
    text: "Без специализированных модулей клиника не может работать с детьми (ожирение, рахит) и пожилыми (саркопения — ~10% людей старше 60 лет).",
  },
  {
    icon: "📉",
    title: "Невозможно отслеживать динамику",
    text: "Результаты pencil beam и fan beam систем нельзя сравнивать. Если пациент меняет клинику — его история обнуляется.",
  },
];

const COMPARISON = [
  { param: "Технология луча", cheap: "Карандашный (pencil beam)", stratos: "Веерный (fan beam)", impact: "critical" },
  { param: "Время полного сканирования", cheap: "15–25 минут", stratos: "Менее 5 минут", impact: "high" },
  { param: "Детектор", cheap: "Одиночный", stratos: "256 элементов (4×64 CdTe)", impact: "critical" },
  { param: "3D-моделирование кости", cheap: "Нет", stratos: "3D-DXA — единственный в мире", impact: "critical" },
  { param: "Анализ состава тела", cheap: "Нет или за доплату", stratos: "В базовой комплектации", impact: "high" },
  { param: "Модуль саркопении", cheap: "Нет", stratos: "Авто расчёт ASM/Height²", impact: "high" },
  { param: "Педиатрическая программа", cheap: "Нет", stratos: "Z-score протоколы", impact: "medium" },
  { param: "Вертебральная морфометрия", cheap: "Нет", stratos: "VFA — 2/3 скрытых переломов", impact: "critical" },
  { param: "Видов исследований", cheap: "3–5", stratos: "20+", impact: "high" },
  { param: "Пропускная способность", cheap: "До 15 пациентов/день", stratos: "30+ пациентов/день", impact: "high" },
];

const IMPACT_COLORS = { critical: "#ef4444", high: "#f59e0b", medium: "#22d3ee" };

/* ── Styles ───────────────────────────────────────────────── */

const cardStyle = {
  background: "linear-gradient(135deg, #0f172a, #1e293b)",
  borderRadius: 16,
  border: "1px solid #334155",
};

const sectionHead = (color) => ({
  fontSize: 22,
  fontWeight: 700,
  paddingLeft: 14,
  borderLeft: `3px solid ${color}`,
  margin: "0 0 18px",
  lineHeight: 1.3,
});

const bodyText = {
  fontSize: 15,
  lineHeight: 1.8,
  color: "#cbd5e1",
  margin: "0 0 16px",
};


/* ── Source reference parser ──────────────────────────────── */

function parseSourceRefs(text) {
  const parts = text.split(/(\[\d+\])/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (match) {
      return (
        <sup key={i}>
          <a
            href="#sources"
            style={{ color: "#22d3ee", textDecoration: "none", fontSize: 11 }}
          >
            [{match[1]}]
          </a>
        </sup>
      );
    }
    return part;
  });
}

/* ── Universal Article Renderer ──────────────────────────── */

function ArticleContent({ article, navigate }) {
  return article.sections.map((section, i) => {
    switch (section.type) {
      case "lead":
        return (
          <p
            key={i}
            style={{
              fontSize: 17,
              lineHeight: 1.8,
              color: "#e2e8f0",
              margin: "0 0 24px",
              fontWeight: 500,
            }}
          >
            {section.text}
          </p>
        );

      case "heading": {
        const Tag = section.level === 3 ? "h3" : "h2";
        const color = section.level === 3 ? "#94a3b8" : "#22d3ee";
        return (
          <Tag key={i} style={sectionHead(color)}>
            {section.text}
          </Tag>
        );
      }

      case "paragraph":
        return (
          <p key={i} style={bodyText}>
            {parseSourceRefs(section.text)}
          </p>
        );

      case "list":
        return (
          <ul
            key={i}
            style={{
              margin: "0 0 20px",
              paddingLeft: 20,
              color: "#cbd5e1",
              lineHeight: 1.8,
            }}
          >
            {section.items.map((item, j) => (
              <li key={j} style={{ marginBottom: 6, fontSize: 15 }}>
                {parseSourceRefs(item)}
              </li>
            ))}
          </ul>
        );

      case "cta": {
        const isBooking = section.variant === "booking";
        const bg = isBooking
          ? "linear-gradient(135deg, #f59e0b, #fbbf24)"
          : "linear-gradient(135deg, #0891b2, #22d3ee)";
        const shadow = isBooking ? "#f59e0b20" : "#22d3ee20";
        const trackId = isBooking
          ? "article_cta_booking"
          : "article_cta_calculator";
        return (
          <div
            key={i}
            style={{
              borderRadius: 20,
              padding: 24,
              background: "linear-gradient(135deg, #0f172a, #1e293b)",
              border: `1px solid ${isBooking ? "#f59e0b20" : "#22d3ee20"}`,
              marginBottom: 24,
            }}
          >
            <button
              onClick={() => {
                tracker.trackClick(trackId);
                navigate(section.link);
              }}
              style={{
                display: "block",
                width: "100%",
                padding: 16,
                border: "none",
                borderRadius: 14,
                background: bg,
                color: "#020617",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                boxShadow: `0 0 20px ${shadow}`,
              }}
            >
              {section.text} →
            </button>
          </div>
        );
      }

      default:
        return null;
    }
  });
}

/* ── Sources Block ────────────────────────────────────────── */

function SourcesBlock({ sources }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div id="sources" style={{ ...cardStyle, padding: 18, marginBottom: 26 }}>
      <h2 style={{ ...sectionHead("#a78bfa"), marginBottom: 10 }}>Источники</h2>
      <ol
        style={{
          margin: 0,
          paddingLeft: 22,
          color: "#94a3b8",
          fontSize: 13,
          lineHeight: 1.8,
        }}
      >
        {sources.map((s) => (
          <li key={s.id}>{s.text}</li>
        ))}
      </ol>
    </div>
  );
}

/* ── Cross-links ──────────────────────────────────────────── */

function CrossLinks() {
  const links = [
    { to: "/analyzer", label: "Калькулятор состава тела" },
    { to: "/clinics", label: "Найти клинику для DXA" },
  ];
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={sectionHead("#64748b")}>Читайте также</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            style={{
              color: "#22d3ee",
              textDecoration: "none",
              fontSize: 14,
              padding: "8px 0",
            }}
          >
            → {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Custom B2B Content (stratos-vs-cheap) ────────────────── */

function CustomContent({ articleMeta, isMobile, navigate }) {
  const [openRisk, setOpenRisk] = useState(null);
  const [showAllRows, setShowAllRows] = useState(false);
  const visibleRows = showAllRows ? COMPARISON : COMPARISON.slice(0, 5);

  return (
    <>
      {/* ═══ 4.2 Statistics ═══ */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: 10,
        marginBottom: 32,
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            ...cardStyle,
            padding: 14,
            textAlign: "center",
            background: "#0f172a",
            borderColor: "#1e293b",
          }}>
            <div style={{
              fontSize: isMobile ? 18 : 20,
              fontWeight: 800,
              color: s.color,
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 4,
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ═══ 4.3 Intro ═══ */}
      <p style={bodyText}>
        На российском рынке денситометрии разворачивается тихая катастрофа. Клиники, стремясь сэкономить, закупают корейские аппараты с карандашным лучом — и не подозревают, что ценой «экономии» становятся ошибочные диагнозы, пропущенные переломы и упущенная выручка.
      </p>

      {/* ═══ Pencil vs Fan Beam ═══ */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={sectionHead("#22d3ee")}>Карандашный луч vs веерный: в чём разница?</h2>
        <p style={bodyText}>
          <strong style={{ color: "#e2e8f0" }}>Pencil beam (карандашный)</strong> — технология 1980-х годов. Один узкий пучок рентгеновских лучей медленно сканирует тело точка за точкой. Полное сканирование занимает 15–25 минут. Дёшев в производстве. Пример: OsteoSys DEXXUM-3 (Южная Корея).
        </p>
        <p style={bodyText}>
          <strong style={{ color: "#e2e8f0" }}>Fan beam (веерный)</strong> — современная технология. Широкий веер рентгеновских лучей и массив детекторов позволяют сканировать всё тело менее чем за 5 минут. Высокое разрешение, больше возможностей для анализа. Пример: DMS Stratos dR (Франция).
        </p>

        {/* Scientific quote */}
        <div style={{
          ...cardStyle,
          background: "#0f172a",
          borderColor: "#334155",
          borderRadius: 16,
          padding: 20,
          marginTop: 20,
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#f59e0b",
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 10,
          }}>
            Научный факт
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "#cbd5e1", margin: 0 }}>
            Мета-анализ 14 когортных исследований (1 233 пациента) подтверждает: результаты pencil beam и fan beam систем систематически расходятся. Исследование Henzell et al. зафиксировало расхождение в классификации пациентов до 45% — клинически неприемлемый уровень.
          </p>
        </div>
      </div>

      {/* ═══ 4.4 Risks Accordion ═══ */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={sectionHead("#ef4444")}>6 реальных рисков дешёвого денситометра</h2>
        {RISKS.map((risk, i) => {
          const isOpen = openRisk === i;
          return (
            <div
              key={i}
              onClick={() => setOpenRisk(isOpen ? null : i)}
              style={{
                ...cardStyle,
                padding: isOpen ? 20 : 16,
                marginBottom: 10,
                cursor: "pointer",
                borderColor: isOpen ? "#ef444440" : "#334155",
                transition: "all 0.3s",
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{risk.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>
                    {risk.title}
                  </span>
                </div>
                <span style={{
                  fontSize: 16, color: "#334155", flexShrink: 0, marginLeft: 8,
                  transform: isOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.3s",
                }}>
                  ▾
                </span>
              </div>
              {isOpen && (
                <p style={{
                  fontSize: 14, lineHeight: 1.7, color: "#94a3b8",
                  margin: "12px 0 0", paddingLeft: 30,
                }}>
                  {risk.text}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ 4.5 Comparison Table ═══ */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={sectionHead("#22d3ee")}>Сравнение: параметр за параметром</h2>
        <div style={{
          ...cardStyle,
          borderRadius: 16,
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1.2fr 1fr 1fr" : "1.5fr 1fr 1fr",
            padding: "12px 16px",
            background: "#020617",
            borderBottom: "1px solid #1e293b",
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{ color: "#64748b" }}>Параметр</span>
            <span style={{ color: "#ef4444" }}>Бюджетный</span>
            <span style={{ color: "#10b981" }}>Stratos dR</span>
          </div>

          {/* Rows */}
          {visibleRows.map((row, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1.2fr 1fr 1fr" : "1.5fr 1fr 1fr",
              padding: "10px 16px",
              borderBottom: i < visibleRows.length - 1 ? "1px solid #1e293b20" : "none",
              fontSize: isMobile ? 12 : 13,
              lineHeight: 1.5,
            }}>
              <span style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                  background: IMPACT_COLORS[row.impact],
                }} />
                {row.param}
              </span>
              <span style={{ color: "#ef4444" }}>{row.cheap}</span>
              <span style={{ color: "#10b981" }}>{row.stratos}</span>
            </div>
          ))}

          {/* Expand button */}
          {!showAllRows && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowAllRows(true); }}
              style={{
                display: "block",
                width: "100%",
                padding: 14,
                border: "none",
                borderTop: "1px solid #1e293b",
                background: "#0f172a",
                color: "#22d3ee",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Показать все {COMPARISON.length} параметров ↓
            </button>
          )}
        </div>
      </div>

      {/* ═══ 4.6 Economics ═══ */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={sectionHead("#f59e0b")}>Экономика решения</h2>
        <p style={bodyText}>
          Парадокс рынка: клиники экономят на оборудовании и теряют на выручке. Дешёвый денситометр не даёт доступа к самому маржинальному сегменту — анализу состава тела (body composition), который приносит в 2–4 раза больше стандартной денситометрии.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 12,
          marginBottom: 20,
        }}>
          {/* Budget */}
          <div style={{
            ...cardStyle,
            padding: 20,
            borderColor: "#ef444430",
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#ef4444",
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10,
            }}>
              Бюджетный аппарат
            </div>
            <div style={{
              fontSize: 28, fontWeight: 800, color: "#ef4444",
              fontFamily: "'JetBrains Mono', monospace", marginBottom: 6,
            }}>
              ₽52K<span style={{ fontSize: 14, fontWeight: 600 }}>/день</span>
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
              15 сканов × ₽3 500 средний чек. Только базовая денситометрия, без body composition.
            </div>
          </div>

          {/* Stratos */}
          <div style={{
            ...cardStyle,
            padding: 20,
            borderColor: "#10b98130",
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#10b981",
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10,
            }}>
              Stratos dR
            </div>
            <div style={{
              fontSize: 28, fontWeight: 800, color: "#10b981",
              fontFamily: "'JetBrains Mono', monospace", marginBottom: 6,
            }}>
              ₽210K+<span style={{ fontSize: 14, fontWeight: 600 }}>/день</span>
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
              30 сканов × mix ₽3 500–₽8 000. Полный спектр: денситометрия + body composition + VFA.
            </div>
          </div>
        </div>

        <p style={bodyText}>
          Окупаемость Stratos dR — 12–15 месяцев при полной загрузке. Бюджетный аппарат окупается за 15–27 месяцев, при этом не имеет потенциала роста выручки за счёт расширения линейки исследований.
        </p>
      </div>

      {/* ═══ 4.7 3D-DXA ═══ */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={sectionHead("#a78bfa")}>3D-DXA: технология без конкурентов</h2>
        <p style={bodyText}>
          DMS Imaging (Франция) — единственный производитель в мире, предлагающий технологию 3D-DXA. Аппарат строит трёхмерную модель бедренной кости на основе стандартного 2D-снимка, что позволяет раздельно оценивать кортикальную и трабекулярную плотность кости.
        </p>
        <p style={bodyText}>
          Эта возможность недоступна ни на корейских бюджетных аппаратах, ни на GE Lunar, ни на Hologic. 3D-моделирование даёт врачу принципиально другой уровень информации для оценки риска перелома и выбора тактики лечения.
        </p>
        <p style={bodyText}>
          Дополнительное преимущество — стабильная логистика из Франции. После 2022 года поставки американского оборудования (GE, Hologic) сопряжены со значительными сложностями. Французское производство обеспечивает предсказуемые сроки и гарантийное обслуживание.
        </p>
      </div>

      {/* ═══ 4.8 CTA ═══ */}
      <div style={{
        borderRadius: 20,
        padding: isMobile ? 24 : 32,
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        border: "1px solid #22d3ee20",
        marginBottom: 24,
      }}>
        <p style={{
          fontSize: 16, lineHeight: 1.7, color: "#cbd5e1",
          margin: "0 0 22px", textAlign: "center",
        }}>
          Дешёвый денситометр — это иллюзия экономии. Stratos dR — инвестиция в полный спектр исследований, двукратную пропускную способность и уникальные технологии.
        </p>
        <button
          onClick={() => {
            tracker.trackClick("news_article_cta_stratos");
            navigate("/clinics");
          }}
          style={{
            display: "block",
            width: "100%",
            padding: 16,
            border: "none",
            borderRadius: 14,
            background: "linear-gradient(135deg, #0891b2, #22d3ee)",
            color: "#020617",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
            boxShadow: "0 0 20px #22d3ee20",
          }}
        >
          Узнать подробнее о Stratos dR →
        </button>
      </div>

      {/* ═══ Инфоблоки для ключевой статьи ═══ */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={sectionHead("#22d3ee")}>Что это</h2>
        <p style={bodyText}>Материал объясняет, как различия в DXA-оборудовании влияют на точность интерпретации показателей плотности кости и состава тела.</p>
        <p style={bodyText}>Цель статьи — снизить риск ошибочной трактовки результатов и помочь клиникам выбирать методику с учётом клинических задач.</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h2 style={sectionHead("#10b981")}>Кому подходит / не подходит</h2>
        <p style={bodyText}>Подходит руководителям клиник, врачам лучевой диагностики, эндокринологам и пациентам, которые отслеживают динамику в долгую.</p>
        <p style={bodyText}>Не подходит как единственный источник для постановки диагноза: решение по лечению должно приниматься на очной консультации специалиста.</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h2 style={sectionHead("#f59e0b")}>Точность и ограничения</h2>
        <p style={bodyText}>Даже при высокой технологичности метода результат зависит от протокола сканирования, позиционирования пациента и сопоставимости оборудования между визитами.</p>
        <p style={bodyText}>Для корректной динамики рекомендуется проходить контрольные исследования в одной клинике и на одном классе аппаратов.</p>
      </div>

      <div style={{ ...cardStyle, padding: 18, marginBottom: 26 }}>
        <h2 style={{ ...sectionHead("#a78bfa"), marginBottom: 10 }}>Источники</h2>
        <ul style={{ margin: 0, paddingLeft: 18, color: "#cbd5e1", lineHeight: 1.7 }}>
          <li><a href="https://iscd.org/learn/official-positions/" target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee" }}>ISCD Official Positions</a></li>
          <li><a href="https://www.bones.nih.gov/" target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee" }}>NIH: Bone Health & Osteoporosis</a></li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee" }}>PubMed: публикации по сравнительной точности DXA-систем</a></li>
        </ul>

/* ── Section-based article renderer ──────────────────────── */

function ArticleContent({ article, isMobile, navigate }) {
  const tagColor = article.tagColor || "#3b82f6";

  const renderSourceRef = (text) => {
    return text.replace(/\[(\d+)\]/g, (_, num) => `⁽${num}⁾`);
  };

  return (
    <>
      {/* ═══ Hero ═══ */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 50,
            background: `${tagColor}15`, border: `1px solid ${tagColor}30`,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: tagColor }} />
            <span style={{
              fontSize: 10, fontWeight: 700, color: tagColor,
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}>
              {article.tag}
            </span>
          </span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15, margin: "0 0 12px" }}>
          {article.title}
        </h1>
        <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 16px" }}>
          {article.subtitle}
        </p>
        <div style={{
          display: "flex", gap: 16, fontSize: 12, color: "#64748b",
          fontFamily: "'JetBrains Mono', monospace", flexWrap: "wrap",
        }}>
          <span>{article.date}</span>
          <span>{article.readTime}</span>
          <span>{article.authorName}</span>
        </div>
      </div>

      {/* ═══ Sections ═══ */}
      {article.sections.map((section, i) => {
        switch (section.type) {
          case "lead":
            return (
              <p key={i} style={{
                fontSize: 17, lineHeight: 1.8, color: "#e2e8f0",
                margin: "0 0 28px", fontWeight: 400,
                borderLeft: `3px solid ${tagColor}`,
                paddingLeft: 16,
              }}>
                {renderSourceRef(section.text)}
              </p>
            );
          case "heading":
            return section.level === 2 ? (
              <h2 key={i} style={sectionHead(tagColor)}>{section.text}</h2>
            ) : (
              <h3 key={i} style={{ fontSize: 18, fontWeight: 700, margin: "0 0 14px", color: "#e2e8f0" }}>
                {section.text}
              </h3>
            );
          case "paragraph":
            return (
              <p key={i} style={bodyText}>{renderSourceRef(section.text)}</p>
            );
          case "list":
            return (
              <ul key={i} style={{ margin: "0 0 24px", paddingLeft: 20, color: "#cbd5e1", lineHeight: 1.8 }}>
                {section.items.map((item, j) => (
                  <li key={j} style={{ fontSize: 15, marginBottom: 6 }}>{item}</li>
                ))}
              </ul>
            );
          case "comparison_table":
            return (
              <div key={i} style={{ ...cardStyle, borderRadius: 16, overflow: "hidden", marginBottom: 28 }}>
                {/* Table header */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1.2fr 1fr 1fr" : "1.5fr 1fr 1fr",
                  padding: "12px 16px",
                  background: "#020617",
                  borderBottom: "1px solid #1e293b",
                  fontSize: 11, fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  <span style={{ color: "#64748b" }}>{section.headers[0]}</span>
                  <span style={{ color: "#f97316" }}>{section.headers[1]}</span>
                  <span style={{ color: "#22d3ee" }}>{section.headers[2]}</span>
                </div>
                {/* Table rows */}
                {section.rows.map((row, ri) => (
                  <div key={ri} style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1.2fr 1fr 1fr" : "1.5fr 1fr 1fr",
                    padding: "10px 16px",
                    borderBottom: ri < section.rows.length - 1 ? "1px solid #1e293b20" : "none",
                    fontSize: isMobile ? 12 : 13,
                    lineHeight: 1.5,
                    background: ri % 2 === 0 ? "transparent" : "#0f172a40",
                  }}>
                    <span style={{ color: "#94a3b8" }}>{row[0]}</span>
                    <span style={{ color: "#f97316" }}>{row[1]}</span>
                    <span style={{ color: "#22d3ee" }}>{row[2]}</span>
                  </div>
                ))}
              </div>
            );
          case "cta": {
            const isBooking = section.variant === "booking";
            const bg = isBooking
              ? "linear-gradient(135deg, #0891b2, #22d3ee)"
              : "linear-gradient(135deg, #f59e0b, #fbbf24)";
            const textColor = "#020617";
            return (
              <button
                key={i}
                onClick={() => {
                  tracker.trackClick(`article_cta_${article.slug}_${section.variant}`);
                  navigate(section.link);
                }}
                style={{
                  display: "block", width: "100%", padding: 16,
                  border: "none", borderRadius: 14,
                  background: bg, color: textColor,
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace",
                  boxShadow: isBooking ? "0 0 20px #22d3ee20" : "0 0 20px #f59e0b20",
                  marginBottom: 12,
                }}
              >
                {section.text} →
              </button>
            );
          }
          default:
            return null;
        }
      })}

      {/* ═══ Sources ═══ */}
      {article.sources && article.sources.length > 0 && (
        <div style={{ ...cardStyle, padding: 18, marginBottom: 26, marginTop: 20 }}>
          <h2 style={{ ...sectionHead("#a78bfa"), marginBottom: 10 }}>Источники</h2>
          <ol style={{ margin: 0, paddingLeft: 20, color: "#cbd5e1", lineHeight: 1.7, fontSize: 13 }}>
            {article.sources.map((src) => (
              <li key={src.id} style={{ marginBottom: 4 }}>{src.text}</li>
            ))}
          </ol>
        </div>
      )}

      {/* ═══ Internal links ═══ */}
      <div style={{ marginBottom: 26 }}>
        <h2 style={sectionHead("#64748b")}>Читайте также</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { to: "/news/skinny-fat", label: "Что такое Skinny Fat и чем он опасен" },
            { to: "/repeat-dxa", label: "Как часто повторять DXA" },
            { to: "/analyzer", label: "Калькулятор состава тела" },
          ].map((link, li) => (
            <Link key={li} to={link.to} style={{
              color: "#22d3ee", fontSize: 14, textDecoration: "none",
              padding: "8px 0", borderBottom: "1px solid #1e293b",
            }}>
              → {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ═══ Legal Disclaimer ═══ */}
      <div style={{
        textAlign: "center", padding: "14px 0",
        borderTop: "1px solid #1e293b",
      }}>
        <p style={{ fontSize: 10, color: "#1e293b", lineHeight: 1.6, margin: 0 }}>
          Имеются противопоказания. Необходима консультация специалиста. Материал носит информационный характер.
        </p>

      </div>
    </>
  );
}

/* ── Component ────────────────────────────────────────────── */

export default function ArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const articleMeta = ARTICLES.find((article) => article.slug === slug);

  useMeta(
    articleMeta?.metaTitle || "Статья не найдена | BODYCOMP",
    articleMeta?.description || "Запрошенная статья не найдена"
  );

  useJsonLd(
    articleMeta
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": articleMeta.title,
          "datePublished": articleMeta.publishedAt,
          "author": {
            "@type": "Organization",
            "name": articleMeta.authorName || "BODYCOMP",
          },
          "mainEntityOfPage": `https://bodycomp.ru/news/${articleMeta.slug}`,
          "image": [articleMeta.image || "https://bodycomp.ru/og-image.png"],
        }
      : null,
    "news-article"
  );

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Redirect unknown slugs
  if (!articleMeta) {
    return (
      <div style={{
        minHeight: "100dvh", background: "#020617", color: "#e2e8f0",
        fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center",
        justifyContent: "center", flexDirection: "column", gap: 16,
      }}>
        <p style={{ color: "#64748b" }}>Статья не найдена</p>
        <button onClick={() => navigate("/news")} style={{
          padding: "10px 20px", border: "none", borderRadius: 10,
          background: "linear-gradient(135deg, #0891b2, #22d3ee)",
          color: "#020617", fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>
          К списку статей
        </button>
      </div>
    );
  }


  const tagColor = articleMeta.tagColor || "#ef4444";

  // ── Section-based articles (contentType: 'article') ──
  if (articleMeta.contentType === "article" && articleMeta.sections) {
    return (
      <div style={{
        minHeight: "100dvh", background: "#020617", color: "#e2e8f0",
        fontFamily: "'Outfit', sans-serif",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px 60px", paddingTop: 104 }}>
          {/* Breadcrumbs */}
          <div style={{
            fontSize: 11, color: "#64748b",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 24, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap",
          }}>
            <Link to="/" style={{ color: "#64748b", textDecoration: "none" }}>Главная</Link>
            <span>→</span>
            <Link to="/news" style={{ color: "#64748b", textDecoration: "none" }}>Новости</Link>
            <span>→</span>
            <span style={{ color: "#94a3b8" }}>Статья</span>
          </div>
          <ArticleContent article={articleMeta} isMobile={isMobile} navigate={navigate} />
        </div>
      </div>
    );
  }

  const visibleRows = showAllRows ? COMPARISON : COMPARISON.slice(0, 5);


  /* ═══ Universal section-based articles ═══ */
  if (articleMeta.sections) {
    return (
      <div style={{
        minHeight: "100dvh",
        background: "#020617",
        color: "#e2e8f0",
        fontFamily: "'Outfit', sans-serif",
      }}>
        <div style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "0 20px 60px",
          paddingTop: 104,
        }}>

          {/* Breadcrumbs */}
          <div style={{
            fontSize: 11,
            color: "#64748b",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 24,
            display: "flex",
            gap: 6,
            alignItems: "center",
            flexWrap: "wrap",
          }}>
            <Link to="/" style={{ color: "#64748b", textDecoration: "none" }}>Главная</Link>
            <span>→</span>
            <Link to="/news" style={{ color: "#64748b", textDecoration: "none" }}>Новости</Link>
            <span>→</span>
            <span style={{ color: "#94a3b8" }}>Статья</span>
          </div>

          {/* Hero */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 16 }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 50,
                background: articleMeta.tagColor + "15",
                border: `1px solid ${articleMeta.tagColor}30`,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: articleMeta.tagColor }} />
                <span style={{
                  fontSize: 10, fontWeight: 700, color: articleMeta.tagColor,
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                  {articleMeta.tag}
                </span>
              </span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15, margin: "0 0 12px" }}>
              {articleMeta.title}
            </h1>
            <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 16px" }}>
              {articleMeta.subtitle}
            </p>
            <div style={{
              display: "flex", gap: 16, fontSize: 12, color: "#64748b",
              fontFamily: "'JetBrains Mono', monospace",
              flexWrap: "wrap",
            }}>
              <span>{articleMeta.date}</span>
              <span>{articleMeta.readTime}</span>
              <span>{articleMeta.authorName}</span>
            </div>
          </div>

          <ArticleContent sections={articleMeta.sections} sources={articleMeta.sources} />
        </div>
      </div>
    );
  }


  return (
    <div style={{
      minHeight: "100dvh",
      background: "#020617",
      color: "#e2e8f0",
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "0 20px 60px",
        paddingTop: 104,
      }}>

        {/* ═══ Breadcrumbs ═══ */}
        <div style={{
          fontSize: 11,
          color: "#64748b",
          fontFamily: "'JetBrains Mono', monospace",
          marginBottom: 24,
          display: "flex",
          gap: 6,
          alignItems: "center",
          flexWrap: "wrap",
        }}>
          <Link to="/" style={{ color: "#64748b", textDecoration: "none" }}>Главная</Link>
          <span>→</span>
          <Link to="/news" style={{ color: "#64748b", textDecoration: "none" }}>Новости</Link>
          <span>→</span>
          <span style={{ color: "#94a3b8" }}>Статья</span>
        </div>

        {/* ═══ Hero (dynamic) ═══ */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 50,
              background: `${tagColor}15`,
              border: `1px solid ${tagColor}30`,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: tagColor }} />
              <span style={{
                fontSize: 10, fontWeight: 700, color: tagColor,
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                {articleMeta.tag}
              </span>
            </span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15, margin: "0 0 12px" }}>
            {articleMeta.title}
          </h1>
          <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 16px" }}>
            {articleMeta.subtitle}
          </p>
          <div style={{
            display: "flex", gap: 16, fontSize: 12, color: "#64748b",
            fontFamily: "'JetBrains Mono', monospace",
            flexWrap: "wrap",
          }}>
            <span>{articleMeta.date}</span>
            <span>{articleMeta.readTime}</span>
            <span>{articleMeta.authorName}</span>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
            <div><strong style={{ color: "#cbd5e1" }}>Автор:</strong> {articleMeta.authorName}</div>
            <div><strong style={{ color: "#cbd5e1" }}>Дата публикации:</strong> {articleMeta.date}</div>
            {articleMeta.updatedAt && (
              <div><strong style={{ color: "#cbd5e1" }}>Дата обновления:</strong> {articleMeta.updatedAt}</div>
            )}
            {articleMeta.sources && (
              <div><strong style={{ color: "#cbd5e1" }}>Источники:</strong> {articleMeta.sources.length} научных публикаций (см. раздел «Источники»)</div>
            )}
            {articleMeta.sourcesCount && (
              <div><strong style={{ color: "#cbd5e1" }}>Источники:</strong> ISCD, NIH, публикации в PubMed (см. раздел «Источники»)</div>
            )}
          </div>
        </div>

        {/* ═══ Content ═══ */}
        {articleMeta.contentType === "custom" ? (
          <CustomContent articleMeta={articleMeta} isMobile={isMobile} navigate={navigate} />
        ) : (
          <>
            <ArticleContent article={articleMeta} navigate={navigate} />
            <SourcesBlock sources={articleMeta.sources} />
          </>
        )}

        {/* ═══ Cross-links ═══ */}
        <CrossLinks />

        {/* ═══ Medical Disclaimer ═══ */}
        <div style={{
          textAlign: "center",
          padding: "14px 0",
          borderTop: "1px solid #1e293b",
        }}>
          <p style={{ fontSize: 10, color: "#1e293b", lineHeight: 1.6, margin: 0 }}>
            Имеются противопоказания. Необходима консультация специалиста. Материал носит информационный характер.
          </p>
        </div>

      </div>
    </div>
  );
}
