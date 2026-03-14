
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as tracker from "../../lib/tracker";

export default function ArchetypeCard({ archetype, fatPct, bmi }) {
  const navigate = useNavigate();

  useEffect(() => {
    tracker.trackEvent("archetype_shown", {
      archetype: archetype.id,
      fat_pct: fatPct,
      bmi,
    });
  }, [archetype.id, fatPct, bmi]);

  const handleCtaClick = () => {
    tracker.trackClick("archetype_cta_dxa", {
      archetype: archetype.id,
      fat_pct: fatPct,
      bmi,
    });
    navigate("/clinics");
  };

  return (
    <div
      style={{
        background: "rgba(15,23,42,0.6)",
        border: `1px solid ${archetype.color}20`,
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
      }}
    >
      {/* Header: emoji + name */}
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: archetype.color,
          marginBottom: 12,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {archetype.emoji} {archetype.name}
      </div>

      {/* Headline */}
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#e2e8f0",
          lineHeight: 1.4,
          marginBottom: 12,
        }}
      >
        {archetype.headline}
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: 13,
          color: "#94a3b8",
          lineHeight: 1.7,
          margin: "0 0 16px",
        }}
      >
        {archetype.description}
      </p>

      {/* Risk block */}
      <div
        style={{
          background: `${archetype.color}15`,
          borderRadius: 12,
          padding: "10px 14px",
          marginBottom: 16,
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
        <span style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.5 }}>
          {archetype.risk}
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "#334155",
          margin: "0 0 16px",
        }}
      />

      {/* Accuracy disclaimer */}
      <div
        style={{
          fontSize: 13,
          color: "#94a3b8",
          lineHeight: 1.7,
          marginBottom: 20,
        }}
      >
        Расчёт приблизительный (±5–8%).
        <br />
        DXA покажет реальную картину: жир, мышцы, кость, висцеральный жир по
        зонам.
      </div>

      {/* CTA Button */}
      <button
        className="btn-lift"
        onClick={handleCtaClick}
        style={{
          width: "100%",
          padding: "14px 16px",
          borderRadius: 14,
          border: "none",
          background: `linear-gradient(135deg, ${archetype.color}, ${archetype.colorDark})`,
          color: "#020617",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          cursor: "pointer",
          marginBottom: 8,
        }}
      >
        {archetype.ctaText}
      </button>

      {/* CTA Subtext */}
      <div
        style={{
          fontSize: 12,
          color: "#94a3b8",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        {archetype.ctaSubtext}
      </div>

      {/* Medical disclaimer */}
      <p
        style={{
          fontSize: 10,
          color: "#64748b",
          textAlign: "center",
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        Имеются противопоказания. Необходима консультация специалиста.
      </p>
    </div>
  );
}
