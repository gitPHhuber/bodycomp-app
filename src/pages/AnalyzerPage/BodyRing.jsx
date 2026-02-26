import { useState, useEffect } from "react";

export default function BodyRing({ fatPct, musclePct }) {
  const [anim, setAnim] = useState(false);
  useEffect(() => { setTimeout(() => setAnim(true), 200); }, []);

  const r = 70, cx = 90, cy = 90, stroke = 16;
  const circ = 2 * Math.PI * r;
  const fatLen = (fatPct / 100) * circ;
  const muscleLen = (musclePct / 100) * circ;
  const otherLen = circ - fatLen - muscleLen;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, justifyContent: "center", padding: "12px 0" }}>
      <svg width={180} height={180} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ef4444" strokeWidth={stroke}
          strokeDasharray={`${anim ? fatLen : 0} ${circ}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#10b981" strokeWidth={stroke}
          strokeDasharray={`${anim ? muscleLen : 0} ${circ}`}
          strokeDashoffset={`${-fatLen}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s" }}
        />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3b82f6" strokeWidth={stroke}
          strokeDasharray={`${anim ? otherLen : 0} ${circ}`}
          strokeDashoffset={`${-fatLen - muscleLen}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.6s" }}
        />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { color: "#ef4444", label: "Жир", value: fatPct },
          { color: "#10b981", label: "Мышцы", value: musclePct },
          { color: "#3b82f6", label: "Другое", value: 100 - fatPct - musclePct },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color }} />
            <span style={{ fontSize: 13, color: "#cbd5e1", fontFamily: "'JetBrains Mono', monospace" }}>
              {item.label}: <b style={{ color: "#fff" }}>{item.value.toFixed(1)}%</b>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
