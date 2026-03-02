// Shared admin panel style constants
export const colors = {
  bg: "#020617",
  sidebar: "#0a0f1e",
  card: "#0f172a",
  cardHover: "#131d35",
  border: "#1e293b",
  borderLight: "#334155",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  textDark: "#475569",
  accent: "#22d3ee",
  accentDark: "#0891b2",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  purple: "#a78bfa",
};

export const fonts = {
  mono: "'JetBrains Mono', monospace",
  body: "'Outfit', sans-serif",
};

export const cardStyle = {
  background: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: 16,
  padding: 24,
};

export const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  background: colors.bg,
  border: `1.5px solid ${colors.borderLight}`,
  color: colors.text,
  fontSize: 14,
  fontFamily: fonts.body,
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

export const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: colors.textMuted,
  marginBottom: 6,
  fontFamily: fonts.mono,
};

export const btnPrimary = {
  padding: "10px 20px",
  border: "none",
  borderRadius: 10,
  background: `linear-gradient(135deg, ${colors.accentDark}, ${colors.accent})`,
  color: colors.bg,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: fonts.body,
  transition: "all 0.2s",
};

export const btnSecondary = {
  padding: "10px 20px",
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
  background: "transparent",
  color: colors.textMuted,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: fonts.body,
  transition: "all 0.2s",
};

export const btnDanger = {
  padding: "10px 20px",
  border: "none",
  borderRadius: 10,
  background: "#991b1b",
  color: "#fca5a5",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: fonts.body,
  transition: "all 0.2s",
};
