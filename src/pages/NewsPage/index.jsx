import { useNavigate } from "react-router-dom";
import { useMeta } from "../../utils/useMeta";
import * as tracker from "../../lib/tracker";

const ARTICLES = [
  {
    slug: "stratos-vs-cheap",
    title: "Почему дешёвый денситометр — это дорого",
    subtitle: "Как устаревшая технология карандашного луча приводит к ошибочным диагнозам",
    date: "2 марта 2026",
    readTime: "7 мин",
    tag: "ЭКСПЕРТИЗА",
    tagColor: "#ef4444",
  },
];

const card = {
  background: "linear-gradient(135deg, #0f172a, #1e293b)",
  borderRadius: 20,
  padding: 24,
  border: "1px solid #334155",
};

export default function NewsPage() {
  useMeta(
    "Новости и статьи | ASVOMED",
    "Экспертные статьи о денситометрии, DXA-сканировании и анализе состава тела"
  );

  const navigate = useNavigate();

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
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>
          Новости и статьи
        </h1>
        <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 28px", lineHeight: 1.5 }}>
          Экспертные материалы о DXA-технологиях и здоровье
        </p>

        {ARTICLES.map((article) => (
          <div
            key={article.slug}
            onClick={() => {
              tracker.trackClick("news_article_open", { slug: article.slug });
              navigate(`/news/${article.slug}`);
            }}
            style={{ ...card, marginBottom: 14, cursor: "pointer", transition: "border-color 0.3s" }}
          >
            {/* Tag badge */}
            <div style={{ marginBottom: 14 }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 50,
                background: article.tagColor + "15",
                border: `1px solid ${article.tagColor}30`,
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: article.tagColor,
                }} />
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: article.tagColor,
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {article.tag}
                </span>
              </span>
            </div>

            {/* Title */}
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.35 }}>
              {article.title}
            </h2>

            {/* Subtitle */}
            <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 14px", lineHeight: 1.6 }}>
              {article.subtitle}
            </p>

            {/* Meta + CTA */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{
                display: "flex",
                gap: 12,
                fontSize: 12,
                color: "#64748b",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                <span>{article.date}</span>
                <span>{article.readTime}</span>
              </div>
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#22d3ee",
              }}>
                Читать →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
