import { useState, useEffect } from "react";

export default function Gauge({ value, min, max, ranges, label, unit }) {
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnim(value), 100);
    return () => clearTimeout(t);
  }, [value]);

  const pct = Math.max(0, Math.min(100, ((anim - min) / (max - min)) * 100));
  const currentRange = ranges.find(r => value >= r.from && value < r.to) || ranges[ranges.length - 1];

  return (
    <div style={{ padding: "20px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: currentRange.color, fontFamily: "'JetBrains Mono', monospace" }}>
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <div style={{ position: "relative", height: 10, borderRadius: 5, overflow: "hidden", background: "#1e293b" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${currentRange.color}88, ${currentRange.color})`,
          borderRadius: 5,
          transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {ranges.map((r, i) => (
          <span key={i} style={{ fontSize: 10, color: r.color, opacity: 0.7, fontFamily: "'JetBrains Mono', monospace" }}>{r.label}</span>
        ))}
      </div>
    </div>
  );
}
