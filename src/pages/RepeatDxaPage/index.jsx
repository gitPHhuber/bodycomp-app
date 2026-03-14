import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMeta } from "../../utils/useMeta";
import { useJsonLd } from "../../utils/useJsonLd";
import * as tracker from "../../lib/tracker";
import Reveal from "../../components/Reveal";
import RetentionTeaser from "../../components/RetentionTeaser";

const card = {
  background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
  borderRadius: 20,
  padding: 24,
  border: "1px solid #334155",
};

const sectionLabel = {
  fontSize: 11,
  color: "#22d3ee",
  fontFamily: "'JetBrains Mono',monospace",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  marginBottom: 8,
};

const WHY_BLOCKS = [
  {
    icon: (
      <svg viewBox="0 0 40 40" width="40" height="40">
        <path d="M20 5 L20 35" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 20 L20 10 L30 20" stroke="#22d3ee" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 30 L30 30" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <path d="M15 25 L25 25" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
    title: "Увидеть, уходит жир или мышцы",
    text: "Минус 3 кг на весах — это может быть жир, а может быть мышцы. Без DXA вы не узнаете.",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" width="40" height="40">
        <rect x="6" y="28" width="6" height="8" rx="1" fill="#334155" />
        <rect x="17" y="20" width="6" height="16" rx="1" fill="#22d3ee" opacity="0.5" />
        <rect x="28" y="10" width="6" height="26" rx="1" fill="#22d3ee" />
      </svg>
    ),
    title: "Оценить реальный прогресс",
    text: "Тренировки, диета, препараты — DXA покажет, что из этого реально работает.",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" width="40" height="40">
        <circle cx="20" cy="20" r="14" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" />
        <circle cx="20" cy="20" r="6" fill="#f59e0b" opacity="0.3" />
        <path d="M20 10 L20 6" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 34 L20 30" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Заметить скрытые изменения вовремя",
    text: "Висцеральный жир, потеря мышц, снижение костной плотности — всё это невидимо снаружи.",
  },
];

const INTERVALS = [
  {
    situation: "Активное похудение / набор массы",
    interval: "2–3 месяца",
    color: "#22d3ee",
  },
  {
    situation: "Стабильный режим тренировок",
    interval: "3–6 месяцев",
    color: "#10b981",
  },
  {
    situation: "Мониторинг после 40 лет",
    interval: "6–12 месяцев",
    color: "#a78bfa",
  },
  {
    situation: "Приём GLP-1 / бариатрия",
    interval: "3 месяца",
    color: "#f59e0b",
  },
];

const COMPARISON_ITEMS = [
  { label: "Динамика общего % жира", color: "#22d3ee" },
  { label: "Изменение мышечной массы по зонам", color: "#10b981" },
  { label: "Тренд висцерального жира", color: "#f59e0b" },
  { label: "Изменение костной плотности", color: "#a78bfa" },
];

export default function RepeatDxaPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useMeta(
    "Повторный DXA — зачем и когда делать | BODYCOMP",
    "Повторный DXA-анализ состава тела: как увидеть реальную динамику жира, мышц и костей. Рекомендуемые интервалы. Запись онлайн."
  );

  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Повторный DXA: что изменилось на самом деле?",
      description:
        "Повторный DXA-анализ состава тела: как увидеть реальную динамику жира, мышц и костей.",
      datePublished: "2026-03-14",
      author: {
        "@type": "Organization",
        name: "BodyComp",
        url: "https://bodycomp.ru",
      },
      publisher: {
        "@type": "Organization",
        name: "BodyComp",
        url: "https://bodycomp.ru",
      },
      mainEntityOfPage: "https://bodycomp.ru/repeat-dxa",
    },
    "repeat-dxa-article"
  );

  const handleCtaClick = (position) => {
    tracker.trackClick("repeat_dxa_cta_book", { position });
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#020617",
        color: "#e2e8f0",
        fontFamily: "'Outfit',sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "80px 20px 60px",
        }}
      >
        {/* ── SECTION 1: HERO ── */}
        <Reveal from="blur" delay={200}>
          <section style={{ marginBottom: 56 }}>
            <h1
              style={{
                fontSize: isMobile ? 26 : 32,
                fontWeight: 800,
                lineHeight: 1.2,
                margin: "0 0 14px",
                color: "#e2e8f0",
              }}
            >
              Повторный DXA: что изменилось{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#22d3ee,#10b981)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                на самом деле?
              </span>
            </h1>

            <p
              style={{
                fontSize: 15,
                color: "#94a3b8",
                lineHeight: 1.7,
                margin: "0 0 24px",
              }}
            >
              Вес может стоять — а состав тела уже другой. Только сравнение двух
              DXA покажет реальную динамику.
            </p>

            <Link
              to="/clinics?scan_type=repeat"
              className="btn-lift btn-pulse"
              onClick={() => handleCtaClick("hero")}
              style={{
                display: "inline-block",
                padding: "14px 28px",
                border: "none",
                borderRadius: 14,
                background: "linear-gradient(135deg,#0891b2,#22d3ee)",
                color: "#020617",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
                cursor: "pointer",
                fontFamily: "'JetBrains Mono',monospace",
                boxShadow: "0 0 20px #22d3ee20",
              }}
            >
              Записаться на повторный DXA
            </Link>
          </section>
        </Reveal>

        {/* ── SECTION 2: ЗАЧЕМ ПОВТОРЯТЬ ── */}
        <section style={{ marginBottom: 56 }}>
          <Reveal from="bottom">
            <div style={sectionLabel}>ЗАЧЕМ ПОВТОРЯТЬ</div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: "0 0 20px",
                color: "#e2e8f0",
              }}
            >
              Что покажет повторный скан
            </h2>
          </Reveal>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {WHY_BLOCKS.map((block, i) => (
              <Reveal
                key={i}
                from={i % 2 === 0 ? "left" : "right"}
                delay={i * 120}
              >
                <div style={card}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                    }}
                  >
                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                      {block.icon}
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          margin: "0 0 6px",
                          color: "#e2e8f0",
                        }}
                      >
                        {block.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 14,
                          color: "#94a3b8",
                          margin: 0,
                          lineHeight: 1.6,
                        }}
                      >
                        {block.text}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── SECTION 3: КОГДА ПОВТОРЯТЬ ── */}
        <section style={{ marginBottom: 56 }}>
          <Reveal from="bottom">
            <div style={sectionLabel}>КОГДА ПОВТОРЯТЬ</div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: "0 0 8px",
                color: "#e2e8f0",
              }}
            >
              Рекомендуемые интервалы
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#64748b",
                margin: "0 0 20px",
                lineHeight: 1.5,
              }}
            >
              По данным практики BodySpec, DexaFit и рекомендациям ISCD
            </p>
          </Reveal>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {INTERVALS.map((item, i) => (
              <Reveal key={i} from="bottom" delay={i * 100}>
                <div
                  style={{
                    ...card,
                    borderLeft: `3px solid ${item.color}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.4 }}
                  >
                    {item.situation}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: item.color,
                      fontFamily: "'JetBrains Mono',monospace",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.interval}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal from="bottom" delay={500}>
            <p
              style={{
                fontSize: 12,
                color: "#64748b",
                fontStyle: "italic",
                margin: "16px 0 0",
                lineHeight: 1.5,
              }}
            >
              Рекомендации ориентировочные. Точный интервал определяет специалист
              с учётом вашей ситуации.
            </p>
          </Reveal>
        </section>

        {/* ── SECTION 4: ЧТО УВИДИТЕ В СРАВНЕНИИ ── */}
        <section style={{ marginBottom: 56 }}>
          <Reveal from="bottom">
            <div style={sectionLabel}>СРАВНЕНИЕ</div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: "0 0 20px",
                color: "#e2e8f0",
              }}
            >
              Что увидите в сравнении
            </h2>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 12,
            }}
          >
            {COMPARISON_ITEMS.map((item, i) => (
              <Reveal key={i} from="scale" delay={i * 100}>
                <div
                  style={{
                    ...card,
                    padding: 18,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 14, color: "#cbd5e1" }}>
                    {item.label}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal from="bottom" delay={450}>
            <div
              style={{
                marginTop: 16,
                textAlign: "center",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  borderRadius: 20,
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  fontSize: 12,
                  color: "#64748b",
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                Графики сравнения — в вашем личном кабинете (скоро)
              </span>
            </div>
          </Reveal>
        </section>

        {/* ── SECTION 5: RETENTION TEASER ── */}
        <Reveal from="bottom">
          <section style={{ marginBottom: 56 }}>
            <RetentionTeaser page="repeat-dxa" />
          </section>
        </Reveal>

        {/* ── SECTION 6: ФИНАЛЬНЫЙ CTA ── */}
        <Reveal from="bottom">
          <section
            style={{
              ...card,
              textAlign: "center",
              padding: 32,
              marginBottom: 56,
              background:
                "linear-gradient(135deg,#0f172a 0%,#164e63 50%,#0f172a 100%)",
            }}
          >
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: "0 0 8px",
                color: "#e2e8f0",
              }}
            >
              Готовы увидеть реальные изменения?
            </h2>

            <p
              style={{
                fontSize: 14,
                color: "#94a3b8",
                margin: "0 0 24px",
                lineHeight: 1.6,
              }}
            >
              Запишитесь на повторный DXA и сравните результаты
            </p>

            <Link
              to="/clinics?scan_type=repeat"
              className="btn-lift btn-pulse"
              onClick={() => handleCtaClick("bottom")}
              style={{
                display: "inline-block",
                padding: "14px 28px",
                border: "none",
                borderRadius: 14,
                background: "linear-gradient(135deg,#0891b2,#22d3ee)",
                color: "#020617",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
                cursor: "pointer",
                fontFamily: "'JetBrains Mono',monospace",
                boxShadow: "0 0 20px #22d3ee20",
                marginBottom: 16,
              }}
            >
              Записаться на повторный DXA →
            </Link>

            <div>
              <a
                href="tel:+73532500303"
                style={{
                  fontSize: 14,
                  color: "#64748b",
                  textDecoration: "none",
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                +7 (3532) 50-03-03
              </a>
            </div>
          </section>
        </Reveal>

        {/* ── SECTION 7: МЕД. ДИСКЛЕЙМЕР ── */}
        <section style={{ marginBottom: 40 }}>
          <div
            style={{
              padding: 18,
              borderRadius: 16,
              background: "#0f172a",
              border: "1px solid #1e293b",
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#475569",
                margin: "0 0 8px",
              }}
            >
              Источники
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: 18,
                fontSize: 12,
                color: "#475569",
                lineHeight: 1.7,
              }}
            >
              <li>
                ISCD Official Positions 2019 — повторная DXA-денситометрия
                рекомендуется через 1–2 года при мониторинге лечения остеопороза
              </li>
              <li>
                Практика BodySpec, DexaFit — повторный анализ состава тела
                каждые 2–3 месяца для оценки динамики
              </li>
            </ul>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: "14px 0",
              borderTop: "1px solid #1e293b",
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: "#334155",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Образовательный контент. Не является медицинской рекомендацией.
              Имеются противопоказания, необходима консультация специалиста.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
