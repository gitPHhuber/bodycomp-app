import React from "react";
import { Link } from "react-router-dom";
import * as tracker from "../lib/tracker";

/* ── Styles ─────────────────────────────────────────────── */

const sectionHead = (color = "#22d3ee") => ({
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

const cardStyle = {
  background: "linear-gradient(135deg, #0f172a, #1e293b)",
  borderRadius: 16,
  border: "1px solid #334155",
};

/* ── Section renderers ──────────────────────────────────── */

function LeadSection({ text }) {
  return (
    <p style={{
      fontSize: 17,
      lineHeight: 1.8,
      color: "#e2e8f0",
      margin: "0 0 28px",
      fontWeight: 400,
    }}>
      {text}
    </p>
  );
}

function HeadingSection({ level, text }) {
  const Tag = level === 3 ? "h3" : "h2";
  const style = level === 3
    ? { ...sectionHead("#94a3b8"), fontSize: 18, marginTop: 24 }
    : { ...sectionHead("#22d3ee"), marginTop: 32 };
  return <Tag style={style}>{text}</Tag>;
}

function ParagraphSection({ text }) {
  return <p style={bodyText}>{text}</p>;
}

function ListSection({ items }) {
  return (
    <ul style={{
      margin: "0 0 20px",
      paddingLeft: 20,
      listStyleType: "none",
    }}>
      {items.map((item, i) => (
        <li key={i} style={{
          fontSize: 15,
          lineHeight: 1.8,
          color: "#cbd5e1",
          marginBottom: 8,
          paddingLeft: 12,
          position: "relative",
        }}>
          <span style={{
            position: "absolute",
            left: -8,
            color: "#22d3ee",
            fontWeight: 700,
          }}>—</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function CtaSection({ variant, text, link }) {
  const isCalculator = variant === "calculator";
  return (
    <div style={{
      borderRadius: 20,
      padding: 28,
      background: "linear-gradient(135deg, #0f172a, #1e293b)",
      border: `1px solid ${isCalculator ? "#22d3ee20" : "#10b98120"}`,
      marginBottom: 24,
      textAlign: "center",
    }}>
      <Link
        to={link}
        onClick={() => tracker.trackClick("article_cta", { variant, link })}
        style={{
          display: "block",
          width: "100%",
          padding: 16,
          border: "none",
          borderRadius: 14,
          background: isCalculator
            ? "linear-gradient(135deg, #0891b2, #22d3ee)"
            : "linear-gradient(135deg, #059669, #10b981)",
          color: "#020617",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "'JetBrains Mono', monospace",
          boxShadow: `0 0 20px ${isCalculator ? "#22d3ee20" : "#10b98120"}`,
          textDecoration: "none",
          textAlign: "center",
        }}
      >
        {text} →
      </Link>
    </div>
  );
}

/* ── Fat norms table ───────────────────────────────────── */

const ROW_COLORS = {
  "Незаменимый жир": "#ef4444",
  "Соревновательный атлет": "#3b82f6",
  "Соревновательная атлетка": "#3b82f6",
  "Подтянутое тело": "#10b981",
  "Среднее": "#eab308",
  "Избыточный жир": "#ef4444",
};

function FatNormsTableSection({ headers, rows }) {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" && window.innerWidth < 640
  );

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {rows.map((row, i) => {
          const color = ROW_COLORS[row[0]] || "#64748b";
          return (
            <div key={i} style={{
              ...cardStyle,
              padding: 16,
              borderLeft: `4px solid ${color}`,
            }}>
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                color,
                marginBottom: 4,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {row[0]}
              </div>
              <div style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#e2e8f0",
                marginBottom: 6,
              }}>
                {row[1]}
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
                {row[2]}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", marginBottom: 24 }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 14,
      }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                textAlign: "left",
                padding: "10px 14px",
                color: "#94a3b8",
                fontWeight: 600,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
                borderBottom: "1px solid #334155",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const color = ROW_COLORS[row[0]] || "#64748b";
            return (
              <tr key={ri} style={{ borderBottom: "1px solid #1e293b" }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: "12px 14px",
                    color: ci === 0 ? "#e2e8f0" : "#cbd5e1",
                    fontWeight: ci === 0 ? 600 : 400,
                    borderLeft: ci === 0 ? `3px solid ${color}` : "none",
                    lineHeight: 1.5,
                  }}>
                    {ci === 1 ? (
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700,
                        color,
                      }}>
                        {cell}
                      </span>
                    ) : cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Internal links ─────────────────────────────────────── */

const INTERNAL_LINKS = [
  { to: "/news/skinny-fat", label: "Скрытый жир: нормальный вес, но высокий процент жира" },
  { to: "/news/dxa-vs-bioimpedance", label: "DXA vs биоимпеданс: какой анализ состава тела точнее" },
  { to: "/news/weight-plateau", label: "Почему вес стоит: теряете жир или мышцы?" },
  { to: "/news/body-fat-norms", label: "Норма процента жира у мужчин и женщин по возрасту" },
  { to: "/repeat-dxa", label: "Повторное DXA: когда и зачем" },
  { to: "/analyzer", label: "Калькулятор состава тела" },
];

function InternalLinksSection() {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={sectionHead("#a78bfa")}>Читайте также</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {INTERNAL_LINKS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={{
              fontSize: 14,
              color: "#22d3ee",
              textDecoration: "none",
              padding: "8px 0",
              borderBottom: "1px solid #1e293b",
              display: "block",
            }}
          >
            → {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Sources ────────────────────────────────────────────── */

function SourcesSection({ sources }) {
  if (!sources?.length) return null;
  return (
    <div style={{ ...cardStyle, padding: 18, marginBottom: 26 }}>
      <h2 style={{ ...sectionHead("#a78bfa"), marginBottom: 10 }}>Источники</h2>
      <ol style={{ margin: 0, paddingLeft: 18, color: "#94a3b8", lineHeight: 1.7 }}>
        {sources.map((s) => (
          <li key={s.id} style={{ fontSize: 13, marginBottom: 4 }}>{s.text}</li>
        ))}
      </ol>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */

export default function ArticleContent({ sections, sources }) {
  return (
    <>
      {sections.map((section, i) => {
        switch (section.type) {
          case "lead":
            return <LeadSection key={i} text={section.text} />;
          case "heading":
            return <HeadingSection key={i} level={section.level} text={section.text} />;
          case "paragraph":
            return <ParagraphSection key={i} text={section.text} />;
          case "list":
            return <ListSection key={i} items={section.items} />;
          case "cta":
            return <CtaSection key={i} variant={section.variant} text={section.text} link={section.link} />;
          case "fat_norms_table":
            return <FatNormsTableSection key={i} headers={section.headers} rows={section.rows} sex={section.sex} />;
          default:
            return null;
        }
      })}

      <InternalLinksSection />
      <SourcesSection sources={sources} />

      {/* Legal Disclaimer */}
      <div style={{
        textAlign: "center",
        padding: "14px 0",
        borderTop: "1px solid #1e293b",
      }}>
        <p style={{ fontSize: 10, color: "#1e293b", lineHeight: 1.6, margin: 0 }}>
          Имеются противопоказания. Необходима консультация специалиста. Материал носит информационный характер.
        </p>
      </div>
    </>
  );
}
