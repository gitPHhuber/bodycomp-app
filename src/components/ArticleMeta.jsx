/**
 * ArticleMeta — compact author / date / readTime line under article title.
 * E-E-A-T signal for YMYL health content.
 */
export default function ArticleMeta({ authorName, reviewerName, publishedAt, updatedAt, readTime }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontSize: 13,
        color: "#64748b",
        lineHeight: 1.8,
        fontFamily: "'Outfit', sans-serif",
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
          <span role="img" aria-label="author">📝</span>
          <span>{authorName || "Редакция BODYCOMP"}</span>
          <span style={{ color: "#334155" }}>·</span>
          <span>{publishedAt}</span>
          {updatedAt && updatedAt !== publishedAt && (
            <>
              <span style={{ color: "#334155" }}>·</span>
              <span>обновлено {updatedAt}</span>
            </>
          )}
          <span style={{ color: "#334155" }}>·</span>
          <span>{readTime}</span>
        </div>

        {reviewerName && (
          <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <span role="img" aria-label="verified">✅</span>
            <span>Проверено: {reviewerName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
