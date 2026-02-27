import { forwardRef } from "react";

const ShareCard = forwardRef(function ShareCard({ results }, ref) {
  if (!results) return null;

  const r = results;
  const gaugeColor = r.bf < 15 ? "#10b981" : r.bf < 25 ? "#22d3ee" : r.bf < 30 ? "#f59e0b" : "#ef4444";

  return (
    <div
      ref={ref}
      style={{
        width: 540,
        padding: 48,
        background: "#020617",
        fontFamily: "'Outfit', 'Manrope', sans-serif",
        color: "#e2e8f0",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 800, fontSize: 20, color: "#22d3ee",
          letterSpacing: "0.04em",
        }}>
          BODYCOMP
        </div>
        <div style={{ fontSize: 12, color: "#475569" }}>bodycomp.ru</div>
      </div>

      {/* Body Type */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          fontSize: 28, fontWeight: 800, marginBottom: 4,
          color: "#e2e8f0",
        }}>
          {r.bt.type}
        </div>
        <div style={{ fontSize: 13, color: "#64748b" }}>Тип телосложения</div>
      </div>

      {/* Fat % gauge bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Жир</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: gaugeColor, fontFamily: "'JetBrains Mono', monospace" }}>
            {r.bf.toFixed(1)}%
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: "#1e293b" }}>
          <div style={{
            height: 8, borderRadius: 4, background: gaugeColor,
            width: `${Math.min(100, (r.bf / 45) * 100)}%`,
          }} />
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
        {[
          { label: "ИМТ", value: r.bmi.toFixed(1), color: "#f59e0b" },
          { label: "FFMI", value: r.ffmi.toFixed(1), color: "#8b5cf6" },
          { label: "Метаболизм", value: `${Math.round(r.bmr)} ккал`, color: "#22d3ee" },
          { label: "TDEE", value: `${Math.round(r.tdee)} ккал`, color: "#10b981" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "#0f172a", borderRadius: 14, padding: 16,
            border: "1px solid #1e293b",
          }}>
            <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
              {s.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Composition */}
      <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 28 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace" }}>{r.fm.toFixed(1)}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>кг жира</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#10b981", fontFamily: "'JetBrains Mono', monospace" }}>{r.lm.toFixed(1)}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>кг без жира</div>
        </div>
      </div>

      {/* Visceral */}
      <div style={{
        background: "#0f172a", borderRadius: 14, padding: 16,
        border: "1px solid #1e293b", marginBottom: 28,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
            Висцеральный жир
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: r.vr.color }}>Риск: {r.vr.level}</div>
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
          WHR: {r.whr.toFixed(2)}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", paddingTop: 16, borderTop: "1px solid #1e293b" }}>
        <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.5 }}>
          Узнай свои цифры на bodycomp.ru
        </div>
      </div>
    </div>
  );
});

export default ShareCard;
