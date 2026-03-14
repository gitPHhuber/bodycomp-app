/**
 * SourcesList — numbered references list at end of article.
 * Style: compact, academic feel, border-left cyan.
 */
export default function SourcesList({ sources }) {
  if (!sources?.length) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{
        fontSize: 18,
        fontWeight: 700,
        paddingLeft: 14,
        borderLeft: "3px solid #22d3ee",
        margin: "0 0 14px",
        lineHeight: 1.3,
        color: "#e2e8f0",
      }}>
        Источники
      </h2>
      <ol style={{
        margin: 0,
        paddingLeft: 22,
        borderLeft: "2px solid #22d3ee20",
      }}>
        {sources.map((s) => (
          <li key={s.id} style={{
            fontSize: 12,
            lineHeight: 1.7,
            color: "#94a3b8",
            marginBottom: 4,
            paddingLeft: 4,
          }}>
            {s.text}
          </li>
        ))}
      </ol>
    </div>
  );
}
