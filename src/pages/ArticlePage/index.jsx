import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMeta } from "../../utils/useMeta";
import * as tracker from "../../lib/tracker";
import { ARTICLES } from "../../content/articles";

/* ── Data ─────────────────────────────────────────────────── */

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

/* ── Component ────────────────────────────────────────────── */

export default function ArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const articleMeta = ARTICLES.find((article) => article.slug === slug);

  useMeta(
    articleMeta?.metaTitle || "Статья не найдена | ASVOMED",
    articleMeta?.description || "Запрошенная статья не найдена"
  );

  const [openRisk, setOpenRisk] = useState(null);
  const [showAllRows, setShowAllRows] = useState(false);
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

  const visibleRows = showAllRows ? COMPARISON : COMPARISON.slice(0, 5);

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

        {/* ═══ 4.1 Hero ═══ */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 50,
              background: "#ef444415",
              border: "1px solid #ef444430",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
              <span style={{
                fontSize: 10, fontWeight: 700, color: "#ef4444",
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                ЭКСПЕРТИЗА
              </span>
            </span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15, margin: "0 0 12px" }}>
            Почему дешёвый денситометр — это дорого
          </h1>
          <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 16px" }}>
            Как устаревшая технология карандашного луча приводит к ошибочным диагнозам и потере пациентов
          </p>
          <div style={{
            display: "flex", gap: 16, fontSize: 12, color: "#64748b",
            fontFamily: "'JetBrains Mono', monospace",
            flexWrap: "wrap",
          }}>
            <span>2 марта 2026</span>
            <span>7 мин</span>
            <span>Редакция ASVOMED</span>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
            <div><strong style={{ color: "#cbd5e1" }}>Автор:</strong> Редакция ASVOMED</div>
            <div><strong style={{ color: "#cbd5e1" }}>Дата публикации:</strong> 2 марта 2026</div>
            <div><strong style={{ color: "#cbd5e1" }}>Дата обновления:</strong> 3 марта 2026</div>
            <div><strong style={{ color: "#cbd5e1" }}>Источники:</strong> ISCD, NIH, публикации в PubMed (см. раздел «Источники»)</div>
          </div>
        </div>

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
        </div>

        {/* ═══ Legal Disclaimer ═══ */}
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
