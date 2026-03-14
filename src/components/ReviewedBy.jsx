/**
 * ReviewedBy — reviewer credentials block at end of article (before sources).
 * Shows reviewer info or a placeholder indicating review is pending.
 */
export default function ReviewedBy({ name, qualification, date, photoUrl }) {
  const cardStyle = {
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    borderRadius: 16,
    border: "1px solid #334155",
    padding: 20,
    marginBottom: 24,
  };

  // Placeholder when no reviewer assigned yet
  if (!name) {
    return (
      <div style={{ ...cardStyle, borderColor: "#334155" }}>
        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>
          <span role="img" aria-label="search" style={{ marginRight: 6 }}>🔍</span>
          Ищем медицинского ревьюера для этого материала
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...cardStyle, borderColor: "#10b98130" }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#10b981",
        fontFamily: "'JetBrains Mono', monospace",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: 14,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        <span role="img" aria-label="verified">✅</span>
        Материал проверен специалистом
      </div>

      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        {/* Photo or placeholder */}
        <div style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "#334155",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
          overflow: "hidden",
        }}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span role="img" aria-label="person">👤</span>
          )}
        </div>

        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 2 }}>
            {name}
          </div>
          {qualification && (
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 2 }}>
              {qualification}
            </div>
          )}
          {date && (
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Дата проверки: {date}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
