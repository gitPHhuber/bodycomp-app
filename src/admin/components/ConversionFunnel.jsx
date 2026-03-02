import { colors, fonts } from "../styles";

const FUNNEL_COLORS = ["#22d3ee", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"];

export default function ConversionFunnel({ steps }) {
  if (!steps || steps.length === 0) return null;

  const maxVal = steps[0]?.value || 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {steps.map((step, i) => {
        const widthPct = Math.max(20, (step.value / maxVal) * 100);
        const pct = i === 0 ? 100 : steps[0].value > 0
          ? ((step.value / steps[0].value) * 100).toFixed(1)
          : 0;
        const dropPct = i > 0 && steps[i - 1].value > 0
          ? ((step.value / steps[i - 1].value) * 100).toFixed(1)
          : null;

        return (
          <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 140,
              fontSize: 12,
              color: colors.textMuted,
              fontFamily: fonts.body,
              textAlign: "right",
              flexShrink: 0,
            }}>
              {step.label}
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              <div style={{
                width: `${widthPct}%`,
                height: 36,
                borderRadius: 8,
                background: `${FUNNEL_COLORS[i % FUNNEL_COLORS.length]}20`,
                border: `1px solid ${FUNNEL_COLORS[i % FUNNEL_COLORS.length]}40`,
                display: "flex",
                alignItems: "center",
                paddingLeft: 12,
                transition: "width 0.5s ease",
              }}>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
                  fontFamily: fonts.mono,
                }}>
                  {step.value.toLocaleString()}
                </span>
              </div>
            </div>
            <div style={{
              width: 70,
              fontSize: 12,
              fontFamily: fonts.mono,
              color: colors.textDim,
              textAlign: "right",
              flexShrink: 0,
            }}>
              {pct}%
            </div>
            <div style={{
              width: 50,
              fontSize: 10,
              fontFamily: fonts.mono,
              color: dropPct ? colors.textDark : "transparent",
              flexShrink: 0,
            }}>
              {dropPct ? `↓${dropPct}%` : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}
