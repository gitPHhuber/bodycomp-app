import { Link } from "react-router-dom";

const sectionHead = {
  fontSize: 22,
  fontWeight: 700,
  paddingLeft: 14,
  borderLeft: "3px solid #a78bfa",
  margin: "0 0 18px",
  lineHeight: 1.3,
};

export default function RelatedArticles({ currentSlug, articles }) {
  const current = articles.find((a) => a.slug === currentSlug);
  if (!current?.relatedSlugs?.length) return null;

  const related = current.relatedSlugs
    .map((s) => articles.find((a) => a.slug === s))
    .filter(Boolean)
    .slice(0, 3);

  if (!related.length) return null;

  return (
    <div style={{ marginTop: 36, marginBottom: 32 }}>
      <h2 style={sectionHead}>Читайте также</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 12,
        }}
      >
        {related.map((article) => {
          const color = article.tagColor || "#22d3ee";
          return (
            <Link
              key={article.slug}
              to={`/news/${article.slug}`}
              style={{
                textDecoration: "none",
                display: "block",
                background: "linear-gradient(135deg, #0f172a, #1e293b)",
                borderRadius: 16,
                border: "1px solid #334155",
                padding: 18,
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = color + "60")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#334155")
              }
            >
              {/* Tag */}
              {article.tag && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 10px",
                    borderRadius: 50,
                    background: color + "15",
                    border: `1px solid ${color}30`,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: color,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color,
                      fontFamily: "'JetBrains Mono', monospace",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {article.tag}
                  </span>
                </span>
              )}

              {/* Title */}
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#e2e8f0",
                  lineHeight: 1.4,
                  marginBottom: 12,
                }}
              >
                {article.title}
              </div>

              {/* Read time */}
              <div
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {article.readTime} →
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
