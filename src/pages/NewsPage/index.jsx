import { useNavigate } from "react-router-dom";
import { useMeta } from "../../utils/useMeta";
import * as tracker from "../../lib/tracker";
import { ARTICLES, NEWS_META } from "../../content/articles";
import { useJsonLd } from "../../utils/useJsonLd";


const card = {
  background: "linear-gradient(135deg, #0f172a, #1e293b)",
  borderRadius: 20,
  padding: 24,
  border: "1px solid #334155",
};

export default function NewsPage() {
  useMeta(NEWS_META.title, NEWS_META.description);

  useJsonLd(
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "name": "Новости и статьи",
          "url": "https://bodycomp.ru/news",
          "mainEntity": { "@id": "https://bodycomp.ru/news#blog" },
        },
        {
          "@type": "Blog",
          "@id": "https://bodycomp.ru/news#blog",
          "name": "Новости и статьи",
          "url": "https://bodycomp.ru/news",
          "blogPost": ARTICLES.map((article) => ({
            "@type": "BlogPosting",
            "headline": article.title,
            "url": `https://bodycomp.ru/news/${article.slug}`,
          })),
        },
      ],
    },
    "news-collection"
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
        <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 16px", lineHeight: 1.5 }}>
          Экспертные материалы о DXA-технологиях и здоровье
        </p>

        <div
          onClick={() => {
            tracker.trackClick("expert_qa_open_from_news");
            navigate("/expert-qa");
          }}
          style={{ ...card, marginBottom: 20, borderColor: "#22d3ee33", cursor: "pointer" }}
        >
          <div style={{ fontSize: 11, color: "#22d3ee", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
            НОВАЯ ПУБЛИЧНАЯ СТРАНИЦА
          </div>
          <h2 style={{ fontSize: 18, margin: "0 0 8px" }}>Экспертные Q/A: DXA, % жира, точность и ограничения</h2>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
            Ответы на частые вопросы с указанием ограничений методов и ссылками на источники.
          </p>
        </div>

        {ARTICLES.map((article) => (
          <div
            key={article.slug}
            onClick={() => {
              tracker.trackClick("news_article_open", { slug: article.slug });
              navigate(`/news/${article.slug}`);
            }}
            style={{ ...card, marginBottom: 14, cursor: "pointer", transition: "border-color 0.3s" }}
          >
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
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: article.tagColor }} />
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

            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.35 }}>
              {article.title}
            </h2>

            <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 12px", lineHeight: 1.6 }}>
              {article.subtitle}
            </p>

            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14, lineHeight: 1.6 }}>
              <div><strong style={{ color: "#94a3b8" }}>Автор:</strong> {article.authorName}</div>
              <div><strong style={{ color: "#94a3b8" }}>Дата:</strong> {article.date}{article.updatedAt && <> · <strong style={{ color: "#94a3b8" }}>Обновлено:</strong> {article.updatedAt}</>}</div>
              <div><strong style={{ color: "#94a3b8" }}>Источники:</strong> {article.sourcesCount || article.sources?.length || 0} внешних публикаций</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                <span>{article.date}</span>
                <span>{article.readTime}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#22d3ee" }}>
                Читать →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
