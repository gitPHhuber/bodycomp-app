import { colors, fonts, cardStyle } from "../styles";

export default function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      ...cardStyle,
      padding: 20,
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
      flex: 1,
      minWidth: 180,
    }}>
      {icon && (
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color || colors.accent}15`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
            stroke={color || colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={icon} />
          </svg>
        </div>
      )}
      <div>
        <div style={{
          fontSize: 11,
          color: colors.textDim,
          fontFamily: fonts.mono,
          letterSpacing: "0.05em",
          marginBottom: 4,
          textTransform: "uppercase",
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 28,
          fontWeight: 800,
          color: color || colors.text,
          fontFamily: fonts.mono,
          lineHeight: 1,
        }}>
          {value ?? "—"}
        </div>
        {sub && (
          <div style={{
            fontSize: 12,
            color: colors.textDim,
            fontFamily: fonts.body,
            marginTop: 4,
          }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
